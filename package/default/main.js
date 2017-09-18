const {
  remote,
  ipcRenderer,
} = require('electron')
const $ = require('jquery')

{
  const win = remote.getCurrentWindow()

  if (localStorage.getItem('bounds')) {
    const bounds = JSON.parse(localStorage.getItem('bounds'))
    win.setBounds(bounds)
  }

  win.on('move', () => {
    localStorage.setItem('bounds', JSON.stringify(win.getBounds()))
  })

  win.show()
}

ipcRenderer.on('message', (event, data) => {
  $('#chat_container').prepend(`
      <div class="chat">
        <div class="icon">
          <img src="${data.image}">
        </div>
        <div class="content">
          <div class="author">${data.name}</div>
          &#8203;
          <div class="message">${data.message}</div>
        </div>
      </div>`)
})
