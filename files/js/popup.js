var msg = $('#msg');

$("#start").click(function(){
	if(this.value == "开始"){
		clk("start");
		this.value = "结束";
	}else{
		clk("close");
		this.value = "开始"
	}
});
function clk(t){
	var 
		time = $("#time").val(),
		size = $("#size").val();

	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendRequest(tab.id, {fn:t, size: size, time:time}, function(response) {
			msg[0].innerHTML = response.msg;
		});
	});
}
