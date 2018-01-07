(function () {
  'use strict'

  if (window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  const DEBUG = false
  const DB_NAME = DEBUG ? 'reading-list-test' : 'reading-list'
  const DB_VERSION = 1
  const DB_PAGE_STORE_NAME = 'page'

  let db

  function todayEpochStart () {
    const interval = 1000 * 60 * 60 * 24
    let time = Math.floor(Date.now() / interval) * interval
    return time
  }

  openDB()

  window.browser.runtime.onMessage.addListener(handleMessage)

  function handleMessage (request, sender, sendResponse) {
    console.log('message', request)
    let type = request.type
    let data = request.data
    if (type === 'add') {
      addToDB(data)
      archiveURL(data.url)
      sendResponse({ 'result': true })
    } else if (type === 'get') {
      getAllItemsInStore(DB_PAGE_STORE_NAME, sendResponse)
      return true
    } else if (type === 'view') {
      let url = window.browser.extension.getURL('index.html')
      sendResponse({ 'data': url })
    } else if (type === 'delete') {
      removeFromDB(data)
    }
  }

  function openDB () {
    let req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = function (evt) {
      db = this.result

      if (!db.objectStoreNames.contains('page')) {
        db.createObjectStore('page',
          { keyPath: 'url', autoIncrement: false })
      }
    }

    req.onsuccess = function (evt) {
      db = this.result
    }

    req.onerror = function (evt) {
      console.error('Failed to open Reading List DB')
      console.error(this.error)
    }
  }

  function addToDB (entry) {
    let store = getObjectStore(DB_PAGE_STORE_NAME, 'readwrite')
    entry.date = todayEpochStart()
    let req = store.put(entry)

    req.onsuccess = function (evt) {
      console.log('Successfully added to reading list:', entry['url'])
    }

    req.onerror = function (evt) {
      console.error('Failed to add to reading list:', entry['url'])
      console.error(this.error)
    }
  }

  function removeFromDB (id) {
    let store = getObjectStore(DB_PAGE_STORE_NAME, 'readwrite')
    let req = store.delete(id)

    req.onsuccess = function (evt) {
      console.log('Successfully deleted from reading list:', id)
    }

    req.onerror = function (evt) {
      console.error('Failed to remove from reading list:', id)
      console.error(this.error)
    }
  }

  function getObjectStore (storeName, mode) {
    let tx = db.transaction(storeName, mode)
    return tx.objectStore(storeName)
  }

  function archiveURL (url) {
    fetch('https://web.archive.org/save/' + url)
      .then(function (res) {
        console.log('Attempted back up of', url, 'with response', res.status)
      })
  }

  function daysElapsed (from, to) {
    return (to - from) / (8.64e+7)
  }

  function getAllItemsInStore (storeName, sendResponse) {
    let tx = db.transaction(storeName, 'readwrite')
    let store = tx.objectStore(storeName)
    let req = store.openCursor()
    let items = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }
    let today = todayEpochStart()

    req.onsuccess = function (evt) {
      let cursor = evt.target.result
      if (cursor) {
        let expiry = 7 - daysElapsed(cursor.value.date, today)
        if (expiry > 0) {
          items[expiry].push(cursor.value)
        } else {
          cursor.delete()
        }
        cursor.continue()
      }
    }

    req.onerror = function (evt) {
      console.error('Failed to prepare', storeName, 'for download')
      console.error(this.error)
    }

    tx.oncomplete = function () {
      sendResponse({ 'data': items })
    }
  }
})()
