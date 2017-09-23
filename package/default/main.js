const {
  remote,
  ipcRenderer,
} = require('electron')
const $ = require('jquery')

{
  const win = remote.getCurrentWindow()

  const bounds = localStorage.getItem('bounds')
  if (bounds) win.setBounds(JSON.parse(bounds))

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
