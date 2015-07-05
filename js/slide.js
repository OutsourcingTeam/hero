;(function(){
	var 
		$ = function(sel, holder){
			return [].slice.call( (holder||document).querySelectorAll(sel) );
		};
	var 
		cover = $(".cover")[0],
		sections = $("#container > section"),
		css_model = function(h,z,l){
			return "-webkit-transform: translate3d("+(l|0)+"px, "+(h|0)+"px, 0); transform: translate3d("+(l|0)+"px, "+(h|0)+"px, 0); z-index: "+(z||1)+";"
		};

	$.on = function(dom, eventType, f){
		[].concat(dom).forEach(function(d){
			d.addEventListener(eventType, f ,false);
		});
		return $;
	};

	window.transform_set = function(dom, i){
		var H = document.documentElement.clientHeight;
		if( "undefined" === typeof i ){
			i = dom | 0;
		}else if( "number" != typeof dom ){
			i = sections.indexOf(dom) + i;
		}
		i = Math.min( Math.max( 0, i ), sections.length - 1);

		if( sections[i].classList.contains("with-cover") ){
			cover.style.cssText = css_model(0, 4 );
			setTimeout(set,500);
			setTimeout(function(){
				cover.style.cssText = css_model(0, 4, document.documentElement.clientWidth);
			},1000);
		}else{
			set();
		}
		function set(){
			sections.forEach(function(section, index){
				switch(index){
					case i: 
						section.style.cssText = css_model();
						section.setAttribute("data-pos","current");
						break;
					case i+1: 
						section.style.cssText = css_model(H,3);
						section.setAttribute("data-pos","next");
						break;
					case i-1: 
						section.style.cssText = css_model(-H,3);
						section.setAttribute("data-pos","prev");
						break;
					default: 
						section.style.cssText = css_model( (index > i) ? H : -H ); 
						section.removeAttribute("data-pos");			 
				}
			});
		}
	};

	transform_set(0);
	// resize
	$.on(window, "resize", function(){
		window.transform_set( 0 );
	});


	// 图片预加载
	all_images = [].slice.call(conf.all_images||[]);
	var loaded = 0;
	all_images.forEach(function(img){
		var m = document.createElement( "img" );
		m.onload = m.onerror = function(){
			loaded +=1;
			if( loaded === all_images.length ){
				setTimeout(function(){
					cover.style.cssText = css_model(0, 4, document.documentElement.clientWidth );
					conf.ready();
				},300);
			}
		};
	});
	if( !all_images.length ){
		setTimeout(function(){
			cover.style.cssText = css_model(0, 4, document.documentElement.clientWidth );
			conf.ready();
		},300);
	}


	// 事件
	var startTy, endTy;
	$.on(sections, "touchstart", function(e){
		var touch = e.touches[0];
			startTy = touch.clientY;
	}).on(sections, "touchmove", function(e){
		var st = this.scrollTop,
			ch = this.clientHeight,
			sh = this.scrollHeight;
		var touch = e.changedTouches[0],
			    endTy = touch.clientY;
		$(".run", this).forEach(function(r){
			if( typeof r.run === "function" ){
				r.run(st/(sh-ch), endTy-startTy);
			}
		});
	}).on(sections, "touchend", function(e){
		var st = this.scrollTop,
			ch = this.clientHeight,
			sh = this.scrollHeight;
		if( st + ch === sh ){
			var touch = e.changedTouches[0],
			    endTy = touch.clientY;
			transform_set(this, startTy > endTy ? 1 : -1 );
		}
	}).on(sections, "mousewheel", function(e){
		var st = this.scrollTop,
			ch = this.clientHeight,
			sh = this.scrollHeight;
		if( st + ch === sh ){
			transform_set(this, e.wheelDeltaY < 0 ? 1 : -1 );
		}else{
			$(".run", this).forEach(function(r){
				if( typeof r.run === "function" ){
					r.run(st/(sh-ch), endTy-startTy);
				}
			});
		}
	});

})();