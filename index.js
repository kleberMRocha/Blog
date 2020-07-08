const customExpress = require('./config/customExpress');
const Blog = require('./models/Blog');
const Post = require('./models/Post');


//mysql 
const conexao = require('./infra/mysql');
conexao.connect((error) => error && console.log(error) 
|| start() && console.log('Conexao feita com sucesso'));

const start = () =>{
  
    const app = customExpress();
    Blog.init(conexao);
    app.listen('4000',() =>{ console.log('Rodando na porta 4000')});
    return app;
}







