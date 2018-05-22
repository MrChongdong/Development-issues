
var a = 1
setInterval(function function_name() {
  a = a + 1
  self.postMessage(a)
}, 1000)

self.addEventListener('close', function (e) {
  console.log('计时关闭')
})