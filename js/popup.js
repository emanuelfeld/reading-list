(function () {
  'use strict'

  if (window.chrome) {
    window.browser = window.chrome
  } else {
    window.browser = browser
  }

  let titleInput = document.getElementById('title')
  let urlInput = document.getElementById('url')
  let submitButton = document.getElementById('submit')
  let viewButton = document.getElementById('view')

  window.browser.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    let tab = tabs[0]
    titleInput.value = tab.title.trim()
    urlInput.value = tab.url.trim()
  })

  function submit () {
    let submitDisabled = submitButton.hasAttribute('disabled')

    if (titleInput.value && urlInput.value && !submitDisabled) {
      let data = {
        'title': titleInput.value,
        'url': urlInput.value
      }

      window.browser.runtime.sendMessage({
        'type': 'add',
        'data': data
      }, function (res) {
        submitButton.textContent = 'Added'
        submitButton.setAttribute('disabled', 'true')
        setTimeout(function () {
          window.close()
        }, 2000)
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
      window.open(res.data)
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
