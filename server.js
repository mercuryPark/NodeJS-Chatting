const express = require('express');
const app = express();
app.use('/public', express.static('public'))
var store = require('store')

app.set('view engine', 'ejs');
const bodyParser= require('body-parser')
app.use(bodyParser.urlencoded({extended: true})) 
app.use(express.urlencoded({extended: true}))
const MongoClient = require('mongodb').MongoClient;
const Db = require('mongodb/lib/db');    

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session()); 

const methodOverride = require('method-override')
app.use(methodOverride('_method'))
var db
var imgUpload
var ajaxInput
var ajaxName

MongoClient.connect('mongodb+srv://hoyeonPark:pop3352!!@cluster0.x2v3tmi.mongodb.net/?retryWrites=true&w=majority', { useUnifiedTopology: true } ,function(에러, client){
    if (에러) return console.log(에러);
    db = client.db('solo');

   
    //서버띄우는 코드 여기로 옮기기
    app.listen('8082', function(){
      console.log('listening on 8082')
    });
  })

// app.listen(8082, function() {
//     console.log('listening on 8082')
// })

app.post('/input', function(요청, 응답){
ajaxInput = 요청.body.ajaxInput

console.log(응답)
console.log(ajaxInput)
})

app.post('/made', function(요청, 응답){
  imgUpload = undefined;
  응답.render('list.ejs')
})

app.get('/test', function(요청, 응답) { 
    응답.send('node서버에 오신걸 환영합니다')
  })

  app.get('/', function(요청, 응답){
    응답.render('index.ejs', {사용자 : 요청.user})
})  

app.get('/list',로그인했니, function(요청, 응답){
    db.collection('post').find().toArray(function(에러, 결과){
        응답.render('list.ejs', {posts : 결과, 사용자:요청.user})
    })
})

  app.get('/write',로그인했니, function(요청, 응답) { 
    응답.render('write.ejs',{사용자 : 요청.user._id})
  })




app.get('/detail/:id', function(요청, 응답){
    db.collection('post').findOne({ _id : parseInt(요청.params.id) }, function(에러, 결과){
      응답.render('detail.ejs', {data : 결과} )
    })
  });

  app.get('/edit:id', function(요청, 응답){
    db.collection('post').findOne({_id : 요청.params.id}, function(에러, 결과){
        응답.render('edit.ejs', {post : 결과})
    })
  });

 
  






  let multer = require('multer');
  var storage = multer.diskStorage({
      destination : function(req, file, cb){
         cb(null, './public/image') 
      },
      filename : function(req, file, cb){
          cb(null, file.originalname)
      }
  });
  
  var upload = multer({storage : storage});
  
 
 

// 로그인 & 회원가입



app.get('/logout',로그인했니, function(요청, 응답){
  요청.logout((req, res) => {
    console.log(res)
  })
  응답.redirect('/list')
  
})

app.get('/member', function(요청, 응답){
  응답.render('member.ejs')
})

app.get('/chat',로그인했니, (요청, 응답) => {
    
  db.collection('chatroom').find({member : 요청.user._id}).toArray().then((결과) => {
      console.log(결과)
      응답.render('chat.ejs', {data : 결과})
  })
})




passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
    
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      
      return done(null, 결과)
    
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));
passport.serializeUser(function (user, done) {
  done(null, user.id)
});


passport.deserializeUser(function (아이디, done) {
  db.collection('login').findOne({ id: 아이디 }, function (에러, 결과) {
    done(null, 결과)
  })
}); 
function 로그인했니(요청, 응답, 통과){
      if(요청.user){
       
        통과();
      }else{
        // 응답.send('로그인 해주세요.')
        응답.redirect('/login')
      }
}



app.get('/login', function(요청, 응답){
  응답.render('login.ejs',{사용자 : 요청.user})
})
app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), function(요청, 응답){
  응답.redirect('/list')
  
  
})
// 회원가입

app.post('/member', function(요청, 응답){
  if(요청.body.name.length > 0){
    db.collection('login').insertOne({name:요청.body.name,id : 요청.body.id, pw:요청.body.pw}, function(에러, 결과){
      응답.redirect('/login')
    })
  }else{
    응답.send('닉네임을 입력해주세요.')
  }
})


app.delete('/delete', function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id);
    //요청.body에 담겨온 게시물번호를 가진 글을 db에서 찾아서 삭제해주세요
    console.log(요청.body._id);
      console.log(요청.user._id);
    db.collection('post').deleteOne({_id : 요청.body._id, 작성자 : 요청.user._id }, function (에러, 결과) {
      
      console.log('에러',에러)
      응답.status(200).send({ message: '성공했습니다' });
    })
});

app.post('/message',로그인했니, function(요청, 응답){
  db.collection('message').insertOne({
    parent : 요청.body.parent,
    userid : 요청.user._id,
    content : 요청.body.content,
    data : new Date(),
  }, function(에러, 결과){
      응답.send(결과)
  })
})

app.get('/message/:id', 로그인했니, function(요청, 응답){

  응답.writeHead(200, {
    "Connection": "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  db.collection('message').find({ parent: 요청.params.id }).toArray()
  .then((결과)=>{
    console.log(결과);
    응답.write('event: test\n');
    응답.write(`data: ${JSON.stringify(결과)}\n\n`);

    const 찾을문서 = [
      { $match: { 'fullDocument.parent': 요청.params.id } }
    ];
  
    const changeStream = db.collection('message').watch(찾을문서);
    changeStream.on('change', result => {
      console.log(result.fullDocument);
      var 추가된문서 = [result.fullDocument];
      응답.write('event: test\n');
      응답.write(`data: ${JSON.stringify(추가된문서)}\n\n`);
    });
  });
});


// chat
// app.get('/chat',로그인했니, function(요청, 응답){
//   db.collection('chatroom').find({member : 요청.user._id}).toArray(function(에러, 결과){
//     응답.render('chat.ejs' , { data : 결과 } )
//   })
 
// })

const { ObjectId } = require('mongodb')

app.post('/chatroom',로그인했니, (요청, 응답)=>{

  db.collection('login').findOne({_id : 요청.user._id}, 
    function(에러, 결과){
   
  
var 저장할거 =   {
  _id : 요청.user._id,
  name : 결과.name,
  title : ajaxInput,
  member:[ObjectId(요청.body.당한사람id) , 요청.user._id],
  date : new Date()
}

  db.collection('chatroom').insertOne(저장할거).then(function(결과){
   응답.send('전송완료')
  
})

})
})




 
  
 
app.post('/img', function(요청, 응답){
  imgUpload = 요청.body.imgSrc
})


app.post('/add',upload.single('profile'), function(요청, 응답){
  console.log(요청.body.profile);
 
  db.collection('counter').findOne({name:'게시물갯수'}, function(에러, 결과){
  var 총게시물갯수 = 결과.totalPost;
  // console.log(요청.body);

  if(imgUpload == undefined){
    imgUpload = '/public/image/185488.png'
  }

  db.collection('post').insertOne({_id : (총게시물갯수 + 1), 작성자 : 요청.user._id, 이름:요청.body.title, 날짜 : 요청.body.date, 이미지 : imgUpload}, function(에러, 결과){
    db.collection('counter').updateOne( {name : '게시물갯수' } , { $inc : { totalPost : 1 } } , function(에러, 결과){
        console.log('수정완료')
        console.log(에러)
      })
}) 

})

// console.log(응답)
  // 응답.send('전송완료')
  응답.redirect('/list')
})