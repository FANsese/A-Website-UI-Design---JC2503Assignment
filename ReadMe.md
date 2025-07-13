# Project Report
The overall structure of the project includes a node_modules folder containing modules to run the project; a public folder containing most content and function realization of the website and a server.js file realizing after end functions. The project website is hosted locally at http://localhost:3000 or https://leftperform-projectcannon-3000.codio-box.uk if run by codio.

## Overall Design
This mainly include server.js, three HTML files, a CSS file and a quiz.js. index.html in public folder contains contents of home page of the website, which also called Inrtoduction page. about.html contains the contents and images of About page, and quiz.html and quiz.js realize the logic of front end logic of quiz game and their operations are relied on server.js. All the HTML files shared only one CSS file, which is style.css, for realizing most of the UI design. For both quiz and about page, there's a navigation bar for convenient shift among contents and different pages, and all of the content are wrapped by cards for clearer display.

## Communtication with Server
The whole process of quiz game is relied on Socket.IO, providing real-time interaction between different users.
### Process
- When users enter their usernames and click the 'Join' button, server will catches them, and show them(expect for the name used by oneself) in the page as a list.
- Server will use a player map to store the online user.
- In the list, if a user want to challenge another, server will check whether challenged user online, create a game record and send it to the target user.
- If challenge accepted, startGame function will be called and randomly choose questions in the questions bank in the server.
- Then server will send questions to users using sendQuestion function, client-side will send users' answer if clicked, and it will be listened by server.
- In the end, quiz.js will calculate the result and send the to users, server will clear the resources using endGame function.
- Server will listen disconnect event, which will help updating online users list.

## Reflection
Though all of the required functions are matched for this application, some problem still exist, no matter the process finishing it, the code style and the ultimate result.

Writing content about page is really a comfort to me, but this led to the large amount of cost of time eventually, and this squeeze the time finishing quiz.

For clearer quote of style.css and avoid define too much css class, a lot temporary style are used in all of the HTML files, which may led to the decrease of readability maintainability of HTML codes.

For quiz application, since for accept challenge hint and final score hint are using system-provided pop-up windows by calling alert in quiz.js, function of challenge another user is not very stable because browser may intercept some of the pop-up windows. Meanwhile, during the round of quiz, real-time score board is not always accurate because the scores shown to both side are the same, though the final score shown to both side is correct.

## Challenges
Many challenges are encountered during process of finishing the assignment. For example, while finishing Introduction and About pages, composing when zooming the windows is always puzzling me. The greatest challenge must be writing front end and after end JavaScipt code, since dealing most of the logic of them and letting them interact correctly is really difficult. But finally, after spare no effort dealing them, these difficulties are finally solved in the final project code.

## Things I learned
By finishing the assignment, I clearly learned how to write HTML code and use CSS style to beautify the pages, I also understand principles of how client and server interact with, and dealing bugs or some bigger problems happened in the interaction of front end and after end. Most importantly, I found the whole process interesting, no matter when I finally solved the problem in the server, or witnessing the page I designed showing correctly.

## Reference and AI usage
A page designed by AI. I reverse-engineered it to learn some HTML and CSS design element like boarder-radius and transition.
I asked AI for some suggestions of optimize usage of Socket.IO


# Update 20250712
既然这沟槽的作业结束了我就用中文说了，简洁易懂些
md我自己都不知道怎么回事，原先在codio上运行得好好的，结果自动测试的时候（没错，自动测试，老子about白瞎了心写这么多）突然没法运行quiz部分，人工测后老师给的反馈是只能在打开终端时运行，我这的结果是在发起挑战的时候需要多摁几次，或者js压根问题就多到没法跑
没错就这样在没动的情况下这玩意从完美无瑕（除了计分bug）变成现在千疮百孔的样子。很莫名其妙，但毫无办法，只拿了78分

如果你是随便逛逛看到了我这段发泄的文字的话，以上内容敬请忽略不计
希望这坨东西能有那么一点用吧
