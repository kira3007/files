var data={},success=0,retry={};

function notice(text,img){
	try{
		var opt={
			type:'basic',
			iconUrl:img,  // icon url - can be relative
			title:'成功',  // notification title
			message:text  // notification body text
		};

		var notification = chrome.notifications.create("",opt,function(){});
		//notification.show();
		
		var notice_timer = setTimeout(function(){
			notification.cancel();
			clearTimeout(notice_timer);
			notice_timer = null;
		},1000*120);
	}catch(e){
		console.log(e);
	}
}

/*chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
        if (request.type == "notice"){
			try{
				notice(request.text,request.img);
				++success;
				sendResponse({farewell: "goodbye"});
			}catch(e){}
		}else if(request.type == "data"){
			$.extend(true,data,request.retry);
		}else if(request.type == "get"){
			sendResponse({data: data});
		}
});
*/
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
        if (request.type == "order"){
			doOrder(request.size,request.img,request.size_text);
		}else if(request.type == "stop"){
			retry[request.size].stop.call();
			retry[request.size].started = false;
		}
});

function sendMessage(data){
	chrome.tabs.query({active:true}, function(tab) {
		chrome.tabs.sendMessage(tab[0].id, data, function(response) {
        //console.log(response.farewell);
		});
	});
}

function doOrder(size,img,size_text,init_count){
	if(retry[size]) return;

	var count = 0;
	var stop = function(){
		clearTimeout(timer);
		timer = null;
	};
	retry[size]={};
	retry[size].stop = stop;
	retry[size].started = true;
	
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
						//$(infoNode).hide();
						++success;
						//countNode.innerHTML = "成功:" + count;
						notice('SIZE: '+size_text+' 的商品已成功加入购物车！',img);
						sendMessage({type:'success',size:size,img:img,success:success});
						//replace_list(size);
						return;
					}
					sendMessage({type:'retry',size:size,img:img,count:++count});
										
					retry[size].started && (timer = setTimeout(args.callee,500));
				}else{
					sendMessage({type:'retry',size:size,img:img,count:++count});

					retry[size].started && (timer = setTimeout(args.callee,500));
				}
			}
		});
	},500);
}

