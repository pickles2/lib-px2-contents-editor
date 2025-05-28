(function(){
/**
 * module: local:sample/sample
 */
try{
	(function(){

$('.sample-sample a').on('click', (event) => {
    console.log(event);
});

	})();

}catch(err){
	console.error('Module Error:', "local:sample/sample", err);
}
})();