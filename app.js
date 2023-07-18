// (1) import modules and packages
const express = require('express');
const multer = require('multer')
const path = require('path');
const fs = require('fs')
const nunjucks =  require('nunjucks');
const { error } = require('console');

// (2) setting app : port
const app = express();
app.set('port',process.env.PORT||8001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);


// (3) middlewares

// json parser
app.use(express.json({limit: '100mb'}));

// 이미지 업로드용 디렉토리 생성
try{
  fs.readdirSync('uploads');
}catch(error){
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads')
}

const upload =  multer({
  storage: multer.diskStorage({
    //업로드 경로
    destination(req,file,done){
      done(null,'uploads/')
    },
    // 파일이름 설정 (확장자 추출)
    filename(req,file,done){
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + "_"+ Date.now() + ext);
    }
  }),
  limits:{fileSize: 5 * 1024 * 1024}
});

// (4) routing

// 이미지 업로드
app.get('',function(req,res){
  res.render('image.html')
});


// input name 속성, field값 image로 설정
app.post('/image', upload.single('image'),function(req,res,next){
  try {
    //업로드된 파일 정보
    console.log(req.file)
    return res.json({"msg":"success"});
} catch(error) {
      console.log(error)
      return res.json({'message':'error'})
    }
});

// 파일 다운로드
app.get('/image',function(req,res){
  try{
    res.download(`uploads/${req.body.filename}`);
  }catch(error){
    console.log(error)
    return res.json({'message':'error'}) 
  }
});

app.use((req, res, next) => {
    const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });

//error handler (4 parameters -err,req,res,next)
app.use((err, req, res, next) => {
    // 템플릿 엔진에서 message 변수 사용 가능
    res.locals.message = err.message; 
    // 템플릿 엔진에서 error 변수 사용가능
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  });

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기중');
});

