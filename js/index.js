(function () {
  'use strict'

  if (window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  const container = document.getElementById('container')

  addArticles()

  function addArticles () {
    window.browser.runtime.sendMessage({
      'type': 'get'
    }, function (res) {
      const items = res.data

      for (let daysLeft = 1; daysLeft < 8; daysLeft++) {
        if (items[daysLeft].length) {
          const dayContainer = document.createElement('section')
          const dayTitle = document.createElement('h2')
          dayTitle.textContent = daysLeft
          dayContainer.appendChild(dayTitle)

          for (let i = 0; i < items[daysLeft].length; i++) {
            const item = formatRow(items[daysLeft][i], dayContainer)
            dayContainer.appendChild(item)
          }

          container.appendChild(dayContainer)
        }
      }
    })
  }

  function formatRow (item, dayContainer) {
    const itemContainer = document.createElement('div')
    itemContainer.className = 'item-container'

    const itemDelete = document.createElement('div')
    itemDelete.textContent = 'X'
    itemDelete.className = 'item-delete'

    const itemLink = document.createElement('div')
    itemLink.className = 'item-link'

    const itemAnchor = document.createElement('a')
    itemAnchor.setAttribute('target', '_blank')
    itemAnchor.href = item.url
    itemAnchor.textContent = item.title

    itemLink.appendChild(itemAnchor)
    itemContainer.appendChild(itemDelete)
    itemContainer.appendChild(itemLink)

    itemDelete.addEventListener('click', function () {
      itemContainer.remove()
      window.browser.runtime.sendMessage({
        'type': 'delete',
        'data': item.url
      })
      if (dayContainer.children.length === 1) {
        dayContainer.remove()
      }
    })

    return itemContainer
  }
})()
