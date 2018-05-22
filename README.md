# 工作中 `IOS` 和 `Android` 遇到的几个兼容性问题
1. Date 对象

    ```
    new Date('2016-05-31 08:00');
    ```
    在安卓或者 pc 浏览器上, 这个是没有任何问题的, 但在 ios 上, 就出现 bug 了, 原因是 ios 没有实现 `YYYY-MM-DD` 这个标准, 而是只实现了 `yyyy/MM/dd` 这个标准, 所以只要把时间字符串中的`-` 换成 `/` 便可兼容了
    
2. 获取编辑框鼠标指针位置的 api 差异, 在输入框失去焦点的时候, 获取焦点位置, 猜一下下面的代码在安卓和 `ios` 的网页输入框获取焦点的时候会有什么区别?
 
 ```
 // editor 是某个输入框
 $('#editor').on('blur',function(e) {
        lastRange = window.getSelection().getRangeAt(0)
  })
 ```
 结果是, 安卓获取到了输入框失去焦点前的位置, 而 ios 获得到的是, 输入框最后的一位的位置, 我猜原因是因为 `ios` 上输入框失去焦点时, 会先把焦点移到输入框最后一位, 再失去焦点, 下面是我来验证一下: 

 ```
  var c = 0;
  $(document).on("selectionchange", function (e) {
        var txt = $('.testText').text()
        c = c + 1;
        $('.testText').text(c)
  })
  $('.edit-blur').on('click', function(e) {
  })
 ```
 验证发现, 安卓上的点击 `blur` 按钮, 数字只会加 1 ,而在 ios 上, 则是直接加了 2 次, 所以我觉得我的猜想是对了 ( 但因为网上查不到对应的资料, 也只能是猜想, 哈哈 ).....
 解决方案, 从全局监听光标事件, 每次改变都记录下光标位置
 
 ```
 // 获取光标
 var lastRange = null
 $(document).on("selectionchange", function (e) {
      if (e.target.activeElement == editor[0]) {
         lastRange = window.getSelection().getRangeAt(0)
      }
})
```

 ```
// 重置光标
var selection = window.getSelection();
selection.removeAllRanges()
var range = document.createRange();
range.setStart(lastRange.startContainer, lastRange.startOffset);
range.setEnd(lastRange.endContainer, lastRange.endOffset);
range.insertNode(el);
selection.addRange(range);

 ```

3. 有没有了解过 ios 上面的触摸行为, 猜猜一下面的 js 在触摸开始时的时候会怎样?

    ```
       <body>
         <div id='test'></div>
        </body>
        <script>
          var a = 1;
          setInterval(function () {
           a = a + 1
            document.getElementById('test').innerText = a
          }, 1000)
        </script>
    ```
    调查: iOS最先响应屏幕反应。响应顺序依次为Touch——Media——Service——Core架构，当用户只要触摸接触了屏幕之后，系统就会最优先去处理屏幕显示也就是Touch这个层级，然后才是媒体（Media），服务（Service）以及Core架构。所以说，当系统接收到Touch事件之后会优先响应，此时会暂停屏幕上包括js、css的渲染, 直到你的手松开到滚动结束。
    
    ![](https://pic4.zhimg.com/80/5a1ac20e022deb75be4d22b317c98e92_hd.jpg)
    
    在触摸开始的时候, 发现定时器完全被中断, 最新的 ios 已经解决了该问题, 但是 ios 国内版 uc 并没有解决, 解决方案, 比较装逼的做法是用 webworker, 每秒由子线程向主线程发送计时结果, 如下:
    
    ```
    // 主线程
    var worker = new Worker('task.js')
    worker.addEventListener('message', function (msg) {
        console.log('收到消息', msg)
        document.getElementById('test').innerText = msg.data
    })
    worker.addEventListener('error', function (err) {
        console.log('收到错误', err)
        worker.terminate()
   })
    ```
    
    ```
    // 子线程 task.js
    var a = 1
    setInterval(function function_name() {
        a = a + 1
        self.postMessage(a)
    }, 1000)

    self.addEventListener('close', function (e) {
        console.log('计时关闭')
    })
    ```
    
    但是兼容低级浏览器的话, 大家还是莫转笔了, 用 `touchstart` 和 `touchend` 来计算时差来解决这问题吧~

3. ios 上的浏览器无法主动触发用户行为的事件, 比如 focus, click , 这个暂时无解...

以上是我在实际业务上遇到, 网上解析也比较少的的问题, 更多别人遇到的问题列表: https://github.com/markyun/My-blog/issues/88

                                
                                
                                




