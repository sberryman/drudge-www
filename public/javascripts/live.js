// update the time ago every N seconds
var updateTimeAgos = function () {
  $('time').each(function (index) {
    var timestamp = $(this).attr('datetime')
    $(this).text(moment(parseInt(timestamp, 10)).fromNow())
  })
}
setInterval(updateTimeAgos, 10000)

// display a new article
var newArticle = function (data) {
  // render the article
  $('#articles').prepend(`
    <a href="${data.url}" class="list-group-item list-group-item-action" target="_blank">
      ${data.text}
      <small>
        <time datetime="${data.at}"></time>
        ${data.headline ? '<span class="badge badge-primary badge-pill">headline</span>' : ''}
        ${data.important ? '<span class="badge badge-danger badge-pill">important</span>' : ''}
      </small>
    </a>
  `)

  // trigger a timestamp update
  updateTimeAgos()
}

function stringFromUTF8Array (data) {
  const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ]
  var count = data.length
  var str = ''

  for (var index = 0; index < count;) {
    var ch = data[index++]
    if (ch & 0x80) {
      var extra = extraByteMap[(ch >> 3) & 0x07]
      if (!(ch & 0x40) || !extra || ((index + extra) > count)) {
        return null
      }

      ch = ch & (0x3F >> extra)
      for (;extra > 0; extra -= 1) {
        var chx = data[index++]
        if ((chx & 0xC0) !== 0x80) {
          return null
        }

        ch = (ch << 6) | (chx & 0x3F)
      }
    }

    str += String.fromCharCode(ch)
  }

  return str
}
