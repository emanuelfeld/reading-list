(function () {
  'use strict'

  if (window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  const titleInput = document.getElementById('title')
  const urlInput = document.getElementById('url')
  const submitButton = document.getElementById('submit')
  const viewButton = document.getElementById('view')

  window.browser.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    const tab = tabs[0]
    titleInput.value = tab.title.trim()
    urlInput.value = tab.url.trim()
  })

  function submit () {
    const submitDisabled = submitButton.hasAttribute('disabled')

    if (titleInput.value && urlInput.value && !submitDisabled) {
      const data = {
        'title': titleInput.value,
        'url': urlInput.value
      }

      submitButton.textContent = 'Added'
      submitButton.setAttribute('disabled', 'true')

      window.browser.runtime.sendMessage({
        'type': 'add',
        'data': data
      }, function (res) {
        console.log('Backup status:', res.data)
        setTimeout(function () {
          window.close()
        }, 800)
      })
    }
  }

  submitButton.addEventListener('click', function (evt) {
    submit()
  })

  viewButton.addEventListener('click', function (evt) {
    window.browser.runtime.sendMessage({
      'type': 'view'
    }, function (res) {
      window.browser.tabs.create({ 'url': res.data })
    })
  })

  urlInput.addEventListener('keypress', function (evt) {
    if (evt.charCode === 13) {
      evt.preventDefault()
      submit()
    }
  })

  titleInput.addEventListener('keypress', function (evt) {
    if (evt.charCode === 13) {
      evt.preventDefault()
      submit()
    }
  })
})()
