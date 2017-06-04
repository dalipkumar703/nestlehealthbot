var bodyParser=require('body-parser');
var mongoose=require('mongoose');
mongoose.connect('mongodb://dalip:123@ds163181.mlab.com:63181/daliptodoapp')
var todoSchema=new mongoose.Schema({
	item:String
});
var Todo=mongoose.model('Todo',todoSchema);
//var data=[{item:'get milk'},{item:'walk dog'},{item:'eat burger'}];
var urlencodeParser= bodyParser.urlencoded({extended:false});
module.exports=function(app) {

	app.get('/todo',function(req,res){
		Todo.find({},function(err,data) {
			if(err) throw err;
			   res.render('todo',{todo:data});
		});

	});
	app.post('/todo',urlencodeParser,function(req,res){
  var newTodo=Todo(req.body).save(function(err,data){
		if(err) throw err;
		res.json(data);
	})
	});
	app.delete('/todo/:item',function(req,res){
    Todo.find({item:req.params.item.replace(/\-/g," ")}).remove(function(err,data){
			if(err) throw err;
			res.json(data);
		});
		
	});
}
