;(function(){
    var /*querySelectorAll封装，返回数组*/
        $ = function(sel, holder){    
            return [].slice.call( (holder||document).querySelectorAll(sel) );
        };

    var 
        cover = $(".cover")[0],
        container = $("#container")[0],
        sections = $("#container > section"),
        holder = document.createElement("div"),
        current_index = 0,
        css_model = function(h,l){
            return "-webkit-transform: translate3d("+(l|0)+"px, "+(h|0)+"px, 0); transform: translate3d("+(l|0)+"px, "+(h|0)+"px, 0);";
        };

        holder.style.cssText = "position: absolute;width: 100%;height: 100%;left: 0;top: 0;z-index: 1;";
        container.appendChild(holder);
        /*批量事件绑定*/
    $.on = function(dom, eventType, f){
        [].concat(dom).forEach(function(d){
            eventType.split(/\W+/).forEach(function(type){
                d.addEventListener(type, f ,false);
            });
        });
        return $;
    };
    $.getType = function(el){
        return Object.prototype.toString.call(el).match(/\[object\s(\w+)\]/)[1];
    };

    // 设置多页切换
    window.transform_set = function(dom, i){
        if( i === 0 ){
            return;
        }
        var fn = arguments[arguments.length-1];
        var H = document.documentElement.clientHeight;
        if( $.getType(dom) === "HTMLElement" ){
            i = sections.indexOf(dom) + (i | 0);
        }else if( $.getType(dom) === "Number" ){
            i = dom | 0;
        }
        i = Math.min( Math.max( 0, i ), sections.length - 1);

        transform_set.running = true;
        if( sections[i].classList.contains("with-cover") ){    //如果有画轴嵌入, 动画时长增加
            cover.style.cssText = css_model(0);
            setTimeout(set,500);
            setTimeout(function(){
                cover.style.cssText = css_model(0, document.documentElement.clientWidth);
            },1000);
        }else{
            setTimeout( set, 0 );
        }
        // 依次设置所有section参数
        function set(){
            if( i && current_index === i ){
                transform_set.running = false;
                return;
            }
            sections.forEach(function(section, index){
                if( i === index ){
                    current_index = i;
                    sections[i].classList.add("active");
                    section.style.cssText = css_model();
                }else if( i < index ){
                    sections[i].classList.remove("active");
                    section.style.cssText = css_model(H);
                }else{
                    sections[i].classList.remove("active");
                    section.style.cssText = css_model(-H);
                }
            });

            // 回调执行
            if( $.getType(fn) === "Function" ){
                fn.call( sections[i] );
            }
            _scrollTop = sections[i].scrollTop;
            (runs[current_index] || []).forEach(function(r){
                var st = sections[i].scrollTop,
                    sh = sections[i].scrollHeight,
                    ch = sections[i].clientHeight,
                    per = st == (sh-ch) ? 1 : st / (sh-ch);
                r.run(per);
            });

            holder.innerHTML = "";
            //在holder上增加新按钮
            $(".outstanding", sections[current_index]).forEach(function(osd){
                var label = document.createElement("label");
                label.style.cssText = "position:absolute;"
                    + "width:"+osd.offsetWidth+"px;"
                    + "height:"+osd.offsetHeight+"px;"
                    + "left:"+osd.offsetLeft+"px;"
                    + "top:"+(osd.offsetTop-sections[current_index].scrollTop)+"px;"
                    + "cursor:pointer;"
                    ;
                $.on(label, "click touchstart touchend", function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    osd.click && osd.click(); 
                });
                holder.appendChild(label);
            });

            setTimeout(function(){
                transform_set.running = false;
            },300);
        }
    };
    transform_set.running = false;

    transform_set(0);
    // resize
    $.on(window, "resize", function(){
        window.transform_set( 0 );
    });


    // 图片预加载
    var conf = window.conf || {
        ready: function () {}
    };
    all_images = [].slice.call(conf.all_images||[]);
    var step = 20, runs = [], ready = function(){
        sections.forEach(function(s, i){
            var div = document.createElement("div"), bg = s.getAttribute("data-bg");
            div.style.cssText = "position:absolute;width:100%;left:0;top:0;z-index:-1;"
                +"height:" + ( Math.ceil( (s.scrollHeight - s.clientHeight) / step ) * step + s.clientHeight ) + "px;"
                +"background:"+ (bg || "none") + ";";
            s.insertBefore(div, s.firstChild);
            runs[i] = $(".run", s).filter(function(r){
                if( typeof r.set === "function" ){
                    var run = r.run || function () {};
                    var trace = [],
                        set = {
                            begin: function(d){d.per = d.per || 0;trace.push(d);return this;},
                            end: function(d){d.per = d.per || 1;trace.push(d);return this;},
                            then: function(d){trace.push(d);return this;}
                        },
                        w = r.offsetWidth,
                        h = r.offsetHeight,
                        W = document.documentElement.clientWidth,
                        H = document.documentElement.clientHeight;
                    
                    r.set(set,w,h,W,H);

                    r.filter = function(per){
                        return per >= trace[0].per && per <= trace[trace.length-1].per;
                    };
                    r.run = function(per, dir){
                        run.call(r, per, dir);
                        for (var i = 1; i < trace.length; i++) {
                            if( trace[i-1].per <= per && trace[i].per >= per ){
                                var prev = trace[i-1], 
                                    next = trace[i],
                                    rate = (per - prev.per) / (next.per - prev.per),
                                    _x = (prev.x+(next.x-prev.x)*rate) || 0,
                                    _y = (prev.y+(next.y-prev.y)*rate) + sections[current_index].scrollTop || 0,
                                    _o = (prev.opacity+(next.opacity-prev.opacity)*rate),
                                    _s = (prev.scale+(next.scale-prev.scale)*rate),
                                    _r = (prev.rotate+(next.rotate-prev.rotate)*rate),

                                    _s = isNaN(_s) ? 1 : _s;
                                    _r = isNaN(_r) ? 0 : _r;

                                var cssText = 
                                    "-webkit-transform: scale("+_s+") translate3d("+_x+"px, "+_y+"px, 0) rotate("+_r+"deg);"
                                    +"transform: scale("+_s+") translate3d("+_x+"px, "+_y+"px, 0) rotate("+_r+"deg);"
                                    + ( isNaN(_o) ? "" : ("opacity: " + _o+ ";") );
                                this.style.cssText = cssText;
                                return ;
                            }
                        };
                    };
                }
                return !!r.run;
            });
        });
        _run();
        conf.ready();
    };
    var loaded = 0;
    all_images.forEach(function(img){
        var m = document.createElement( "img" );
        m.onload = m.onerror = function(){
            loaded +=1;
            if( loaded === all_images.length ){
                setTimeout(function(){
                    ready();
                },300);
            }
        };
        m.src = img.src;
    });
    if( !all_images.length ){
        setTimeout(function(){
            ready();
        },300);
    }

    // 事件
    var startTy, curTy, endTy, autoStep;
    $.on(holder, "touchstart", function(e){
        var touch = e.touches[0];
            startTy = curTy = touch.clientY;
    }).on(holder, "touchmove", function(e){
        var touch = e.changedTouches[0],
                endTy = touch.clientY;
        run( 3*(curTy - endTy), e);
        curTy = endTy;
    }).on(holder, "touchend", function(e){
        var touch = e.changedTouches[0],
                endTy = touch.clientY;
        run(startTy > endTy ? 1 : -1, e);
        startTy = curTy = endTy = 0;
    }).on(document, "keydown", function(e){
        switch(e.keyCode){
            case 32: 
            case 39:
            case 40: run( step, e ); break;
            case 37:
            case 38: run( -step, e ); break; 
        }
    }).on(document, "mousewheel", function(e){
        run(e.wheelDeltaY < 0 ? step: -step, e );
    });

    function run(dir, e){
        e.stopPropagation();
        e.preventDefault();
        if( transform_set.running ){
            return;
        }

        var _this = sections[current_index];
        var st = _this.scrollTop,
            ch = _this.clientHeight,
            sh = _this.scrollHeight;
        scrollTy = st;

        _scrollTop = _this.scrollTop + dir;
        //st = _this.scrollTop = _this.scrollTop + dir;

        // console.log(st);
        // console.log(ch);
        // console.log(sh);

        _dir = dir;

        if(!_this.scrollTop && dir < 0){
            var prev = Number( _this.getAttribute("data-prev") );
            transform_set(_this, isNaN( prev ) ? -1 : prev );
        }else if( _this.scrollTop + ch >= sh && e.type !== "touchmove"){
            var next = Number( _this.getAttribute("data-next") );
            transform_set(_this, isNaN( next ) ? Math.abs(dir) / (dir||1) : next );
        }else{
            
        }
    }

    var _scrollTop = 0, 
        _dir = 0; 
    function _run(){
        var _this = sections[current_index];
        var st = _this.scrollTop,
            ch = _this.clientHeight,
            sh = _this.scrollHeight;

        var osds = $(".outstanding", _this);
        $("label",holder).forEach(function(label, i){
            osd = osds[i];
            label.style.cssText = "position:absolute;"
                + "width:"+osd.offsetWidth+"px;"
                + "height:"+osd.offsetHeight+"px;"
                + "left:"+osd.offsetLeft+"px;"
                + "top:"+(osd.offsetTop-_this.scrollTop)+"px;"
                + "cursor:pointer;"
                ;
        });

        if( _this.scrollTop !== _scrollTop){
            _this.scrollTop = _scrollTop;
            runs[current_index].forEach(function(r){
                if( typeof r.run === "function" ){
                    var per = _this.scrollTop == (sh-ch) ? 1 : _this.scrollTop / (sh-ch);
                    r.filter = r.filter || function(per){return true};
                    if( r.filter(per) ){
                        r.run(per, _dir);
                    }else{
                        r.style.cssText = "";
                    }
                }
            });
        }
        setTimeout(_run, 1000/60);
    };

})();