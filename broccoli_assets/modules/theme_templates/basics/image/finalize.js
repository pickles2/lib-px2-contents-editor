/**
 * finalize.js
 */
module.exports = function(html, callback, supply){
	// console.log(html);

	var $ = supply.cheerio.load(html, {decodeEntities: false});
	var src = $('img').eq(0).attr('src');
	src = src.replace( /^\.\/theme_files\/([\s\S]*)$/, '<?= htmlspecialchars( $theme->files(\'/$1\') ) ?>' );
	// console.log(src);
	// console.log('=-=-=-=-=-=-=');
	$('img').eq(0).attr({'src': src});
	html = $.html();

	// console.log(html);
	callback(html);
	return true;
}
