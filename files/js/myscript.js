var 
	
	weibo = 'http://v.t.sina.com.cn/share/share.php?title={title}&url={url}&pic={img}',
	
	qq = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?title={title}&url={url}&pics={img}&showcount=1',
	
	comment = 'http://comment',
	
	share = {
		title:encodeURIComponent('唯品会抢购神器！刚刚用这个插件成功抢到了心爱的宝贝，大家来试试'),
		url:encodeURIComponent('http://www.baidu.com')
	},
	
	enable = false,

	size = '230',
	
	maxPrice = 1000000,

	node,
	
	src,
	
	detail_done = {},
	
	count = 0,
	
	retry = {},
	
	retry_wrap,

	dur = 500,
	
	//timer,
	
	sizeInput = $("#J_sizeId_input"),
	
	tip = $(document.body).append('<div class="myClass" style="position:fixed;z-index:999;height:30px;background:#f0f0f0;border:1px solid #999;font-size:16px;font-weight:bold;top:0px;width:160px;line-height:30px;color:#2FB416;">'+
										'<span style="">点击绿色按钮抢购</span>'+
										'<span style="padding-right:10px;"></span>'+
										'<a id="qq" style="float:right;display:none;" target="_blank" href='+qq+' data='+qq+'>'+
											'<img src="http://qzonestyle.gtimg.cn/favicon.ico"/></a>'+
										'<a id="weibo" style="float:right;display:none;" target="_blank" href='+weibo+' data='+weibo+'>'+
											'<img src="http://t.sina.com.cn/favicon.ico"/></a>'+
										'<a id="comment" style="float:right;display:none;" target="_blank" href='+comment+'>'+
											'给好评</a>'+
								  '</div>'),
	
	infoNode = $('span',$(".myClass"))[0],
	
	countNode = $('span',$(".myClass"))[1],
	
	share_link = $('#weibo,#qq');
	
	addCss('.qk_btn{top: 10px;padding: 5px;border: 1px solid #999;display: inline-block;margin:0 10px 5px 0;cursor: pointer;font-weight:bold;background:#eeeeee;}');
	addCss('.qk_btn_wrap{padding:5px;padding-bottom:0;border:1px solid #666;} a.qk_btn{background-color:rgb(54, 204, 54);} .try_btn{border:1px solid #dcdcdc;color:#fff;} #weibo img{width:18px;height:18px} #weibo{padding-top:5px;line-height:18px;} #qq{padding:6px 0 0 5px;line-height:18px;} #comment{font-size:12px;padding-right:5px;color:blue;}');
	addCss('.pnew_list li{height:auto !important;}  .retry_wrap{position:fixed;left:0;top:32px;z-index:999;border: 1px solid #999;border-bottom:none;border-top:none;} .retry_wrap li.success{background:rgb(177, 177, 177);} .retry_wrap li{height:48px;background:#f0f0f0;border-bottom: 1px solid #999;padding: 5px;} .retry_wrap img{width:32px;height:48px;margin-right:10px;float:left;} .retry_wrap p{width:120px;padding-bottom:10px;} .retry_wrap a{padding-left:0px;display:block;float:right;} .retry_wrap span{font-weight:bold;color: rgb(57, 33, 233);} .retry_wrap a:hover{text-decoration:underline;}');
	
//if(sizeInput.val){
	//enable = true;
	getAllProducts();

var dt = setTimeout(function(){
	getAllProducts();
	dt = setTimeout(arguments.callee,4000);
},4000);
	//getOneProduct("230(36");
//}

function addCss(CSS){
    var s = document.createElement( 'style' );
    s.innerHTML = CSS;
    document.getElementsByTagName( 'head' )[ 0 ].appendChild( s );
}


function getAllProducts(){
	enable = true;
	$(".J_pro_items,.modules").each(function(){
		var id = ($(".pro_list_pic a",this).attr('href') && $(".pro_list_pic a",this).attr('href').match(/-(\d+)-(\d+)/))
				 || $("a.noPic",this).attr('href').match(/-(\d+)-(\d+)/),
				 
			price = ($(".deep_red", this).html() || '').match(/¥(\d+)/) || $(".price", this).html().match(/¥(\d+)/);
		
		if(price[1] > maxPrice)
			return;
		
		if(detail_done[id[2]])
			return;
			
		getDetail(id,showQuickBtn,this);
	});
}
function showQuickBtn(obj,p){
	//for(var i=0,len = obj.items.length;i<len;i++){
	$.each(obj.items,function(index,item){
		//if(item.min){
			//console.log(obj.items[i].id);
			var cc =$(p).find(".qk_btn_wrap").length ? $(p).find(".qk_btn_wrap") : $('<dd class="qk_btn_wrap"></dd>').appendTo(p);
			var cls = item.min ? 'qk_btn' : 'qk_btn try_btn';
			var btn = $('<a class="'+cls+'">'+item.name+'</a>').appendTo(cc);
			var id = item.id;
			
			btn.click(function(){
				var mtime = +new Date(),
					time = parseInt(mtime/1000),
					img = $(p).find('img.J_first_pic').eq(0).attr('src') 
						  || $(p).find('img').eq(0).attr('src') 
						  || $('.J_mer_smallImg').eq(0).attr('src'),
						  
					size_text = this.innerHTML;
	
				doOrder(id,img,size_text);
			});
		//}
	});
	
	//}
}
function getDetail(id,cb,cur_size){
	$.ajax({
		url: "http://stock.vip.com/detail/?callback=te_detail&merchandiseId="+id[2]+"&brandId="+id[1],
		type: 'GET',
		data: null,
		dataType: "text",
		success:function(data){
			var t = data.match(/te_detail\((.+)\)/)[1],
				obj = JSON.parse(t);
					
			//doBuy(obj);
			detail_done[id[2]] = true;
			
			cb.call(this,obj,cur_size);
		}
	});
}

function forceBuy(obj,cur_size){
	for(var i=0,len = obj.items.length;i<len;i++){
		if(obj.items[i].name.match(cur_size)){
			//console.log(obj.items[i].id);
			var mtime = +new Date(),
				time = parseInt(mtime/1000);
	
			doOrder(obj.items[i].id);
		}
	}
}

function doBuy(obj){
	for(var i=0,len = obj.items.length;i<len;i++){
		if(obj.items[i].min && obj.items[i].name.match(size)){
			//console.log(obj.items[i].id);
			var mtime = +new Date(),
				time = parseInt(mtime/1000);
	
			doOrder(obj.items[i].id);
		}
	}
}
//http://www.vipshop.com/if/te_old.php?callback=te_detail&act=getSizeStock&merchandiseId=14269771&brandId=110070
/*te_detail({"items":[{"id":"38196405","stock":"2","sn":"A2312330200138","name":"240(38)","min":"1","max":"2","type":0},
					{"id":"38196406","stock":0,"sn":"A2312330200139","name":"245(39)","min":0,"max":0,"type":1},
					{"id":"38196407","stock":0,"sn":"A2312330200140","name":"250(40)","min":0,"max":0,"type":1},
					{"id":"38196408","stock":0,"sn":"A2312330200141","name":"255(41)","min":0,"max":0,"type":1},
					{"id":"38196409","stock":0,"sn":"A2312330200142","name":"260(42)","min":0,"max":0,"type":1},
					{"id":"38196410","stock":0,"sn":"A2312330200143","name":"265(43)","min":0,"max":0,"type":1}]});
*/

function getOneProduct(size_text){
	var sizeID,time,mtime;
	
	if(size_text){
		$("dd.size_list li").each(function(i) {
			if (this.innerHTML.indexOf(size_text) != -1) {
				sizeID = $(this).attr('data-id');
			}
		});
		if(!sizeID){
			//try ajax
			var parentPage = window.location.href.replace(/-\d+\.html/,'.html').replace('detail','show'),
				pdc_id = window.location.href.match(/-(\d+)-(\d+)/);
				
			getDetail(pdc_id,forceBuy,size_text);
			return;
			
		}
	}else if(sizeInput.val){
		sizeID = sizeInput.val;
	}else{
		return;
	} 
	//sizeID = '41061505';
	
	mtime = +new Date();
	time = parseInt(mtime/1000);
	
	doOrder(sizeID);
}

/*function doOrder(size,img,size_text,init_count){
	if(!enable || retry[size]) 
		return;
		//cb({"result":1,"msg":"","total":278,"sku_count":1,"end_time":"1382780649"}) 
		//cb({"result":0,"msg":"\u62b1\u6b49\uff0c\u6570\u91cf\u6709\u9650\uff0c\u60a8\u6700\u591a\u53ea\u80fd\u8d2d\u4e702\u4ef6\uff01"}) 
	
	var stop = function(){
		clearTimeout(timer);
		timer = null;
	};
	var timer = setTimeout(function(){
	
		var args = arguments,
			mtime = +new Date(),
			
		time = parseInt(mtime/1000);
		
		$.ajax({
			url: 'http://cart.vip.com/te2/add.php?act=add&client_time='+time+'&size_id='+ size+'&num=1&callback=cb',
			type: 'GET',
			data: null, //'act=add&client_time='+time+'&size_id='+ size+'&num=1&_='+mtime,
			dataType: "text",
			success:function(data){
				//console.log(size);
				if(data){
					var t = data.match(/cb\((.+)\)/)[1],
						obj = JSON.parse(t);
				
					if(obj.result){
						$(infoNode).hide();
						++count;
						countNode.innerHTML = "成功:" + count;
						notice('SIZE: '+size_text+' 的商品已成功加入购物车！',img);
						replace_list(size);
						return;
					}
					
					//++retry;
					if(retry[size]){
						retry[size].html(retry[size].html()-0+1);
					}else{
						retry[size] = create_retry(size,img,stop,init_count);
						retry[size].info = {img:img,size_text:size_text};
					}
										
					retry[size] && (timer = setTimeout(args.callee,dur));
				}else{
					//++retry;
					if(retry[size]){
						retry[size].html(retry[size].html()-0+1);
					}else{
						retry[size] = create_retry(size,img,stop,init_count);
						retry[size].info = {img:img,size_text:size_text};
					}
					
					retry[size] && (timer = setTimeout(args.callee,dur));
				}
				
				storeData();
			}
		});
	},dur);
}*/

function doOrder(size,img,size_text,init_count){
	chrome.extension.sendMessage({size: size,img:img,size_text:size_text,type:'order'}, function(response) {
		//console.log(response.farewell);
	});		
}

function replace_list(size){
	if(!retry[size]){
		return;
	}
	var li = retry[size].parent().parent();
	li.find('a').html('隐藏').end().append('<span>成功！</span>');
	li.addClass('success').insertBefore($('.retry_wrap li').first());
}

function create_retry(size,img,init_count){
	retry_wrap = retry_wrap || $('<ul class="retry_wrap"></ul>').appendTo(document.body);
	var
		init_count = init_count || 1,
		li = $('<li><img src="'+img+'"/><p>尝试：<span>'+init_count+'</span>次</p><a href="javascript:;">取消</a></li>').appendTo(retry_wrap),
		$retry = li.find('span');
		
	li.find('a').on('click',function(){
		//stop.call();
		chrome.extension.sendMessage({size:size,type:'stop'}, function(response) {});
		li.remove();
		retry[size] = null;
	});
	
	return $retry;
}
function listOne(){
	var 
		pdc_id = window.location.href.match(/-(\d+)-(\d+)/);
				
	if(pdc_id){
		//getDetail(id,showQuickBtn,this);
		$('.size_list_item').hide();
		getDetail(pdc_id,showQuickBtn,$('.size_list ul'));
	}
	
}

/*
 *商品详情页的抢购
*/

listOne();
function notice(text,img){

	share.img = encodeURIComponent(img);
	//share
	share_link.each(function(){
		this.href=$(this).attr('data').replace(/\{(\w+)\}/g,function(){return share[arguments[1]];});
	});
	$('#comment').show();
	share_link.show();
	
	chrome.extension.sendMessage({text: text,img:img,type:'notice'}, function(response) {
		//console.log(response.farewell);
	});
}

function storeData(){
	var data = {
		retry:{},
		type:'data'
	};
	
	for(var p in retry){
		data.retry[p] = {count:retry[p].html()};

		$.extend(data.retry[p],retry[p].info);
	}
	
	chrome.extension.sendMessage(data, function(response) {
		//console.log(response.farewell);
	});
}

/*
 *翻页后，或者别的页面的数据
*/
/*getData();
function getData(){
	chrome.extension.sendMessage({type:'get'}, function(response) {
		var data = response && response.data;
		if(!data) return;
		
		for(var p in data){
			doOrder(p,data[p].img,data[p].size_text,data[p].count);
		}
	});
}
*/
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.type == 'success'){
		$(infoNode).hide();
		countNode.innerHTML = "成功:" + request.success;
		
		share_link.each(function(){
			this.href=$(this).attr('data').replace(/\{(\w+)\}/g,function(){return share[arguments[1]];});
		});
		$('#comment').show();
		share_link.show();
		
		replace_list(request.size);
	}else if(request.type == 'retry'){
		if(retry[request.size]){
			retry[request.size].html(retry[request.size].html()-0+1);
		}else{
			retry[request.size] = create_retry(request.size,request.img,request.count);
			//retry[size].info = {img:img,size_text:size_text};
		}
	}
});