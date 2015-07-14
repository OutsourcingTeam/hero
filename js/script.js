;function toTop(){
    this.scrollTop = 0;
};
var $ = function(sel){return document.querySelector(sel);};
var cover = $(".cover");
    conf = {
        all_images : [
            {src:"css/images/bg.jpg"},
            {src:"css/images/slogan.png"},
            {src:"css/images/1.png"},
            {src:"css/images/2.png"},
            {src:"css/images/3.png"},
            {src:"images/1.png"},
            {src:"images/h5.png"},
            {src:"images/ying.png"},
            {src:"images/xiong.png"},
            {src:"images/bang.png"},
            {src:"images/p3-bg.png"},
            {src:"images/p3-sun.png"},
            {src:"images/flowers.png"},
            {src:"images/water.png"},
            {src:"images/p2-1.png"},
            {src:"images/p2-2.png"},
            {src:"images/boat.png"},
            {src:"images/tree.png"}
        ], //根据每组数据的src属性进行加载判断
        ready: function(){
            // cover.classList.add("init");
            playAudio();
            cover.style.cssText = "transform: translate3d("+document.documentElement.clientWidth+"px,0,0);"
            +"-webkit-transform:translate3d("+document.documentElement.clientWidth+"px,0,0);"
            setTimeout(function(){
                document.getElementById('page1').classList.add('active');
            },1000);
        }
    };
    

    var fadeCss=function(t,o,definedCss){
        return 'top:'+t+'px;opacity:'+o+';';
    }
    var bgAction=function(id,innerid,pArray,cPositon,cOffset,edge){
        var el=document.getElementById(id);
        var iel=document.getElementById(innerid);
        el.set = function(set,w,h,W,H){
            set.begin({
                per: pArray[0],
                x: 0,
                y: H+h,
                opacity:0.1
            }).then({
                per:pArray[1]-0.15,
                x: 0,
                y: H-h,
                opacity: 1
            }).end({per:pArray[1],
                x: 0,
                y: 0,
                opacity: 0.3
            });
        };
        iel.set = function(set,w,h,W,H){
            set.begin({
                per: pArray[0],
                scale:1
            }).then({
                per:pArray[1]-0.15,
                scale:1
            }).end({per:pArray[1],
                x: 0,
                scale:.5
            });
        };
    }
    var text00=document.getElementById('text00');
    // text00.style.cssText=fadeCss(document.body.offsetHeight-text00.offsetHeight,1)
    text00.set=function(set,w,h,W,H){
        set.begin({
            per: 0,
            x: 0,
            y: H-h,
            opacity:1,
            scale:1
        }).end({per:0.2,
            x: 0,
            y: H-h,
            opacity: 0,
            scale:.95
        });
    };

    var sun01=document.getElementById('sun01');
    // sun01.style.cssText=fadeCss(document.body.offsetHeight-sun01.offsetHeight,1)
    sun01.set=function(set,w,h,W,H){
        set.begin({
            per: 0,
            x: 0,
            y: H-h-100,
            opacity:1,
            scale:1
        }).end({per:0.2,
            x: 0,
            y: -h,
            opacity: 0,
            scale:1
        });
    };
    

    bgAction('text01','ti01',[0.1,0.42],'bottom',50);
    bgAction('text02','ti02',[0.18,0.50],'bottom',50);
    bgAction('text03','ti03',[0.26,0.58],'bottom',50);
    bgAction('text04','ti04',[0.34,0.66],'bottom',50);
    bgAction('text05','ti05',[0.42,0.74],'bottom',50);
    bgAction('text06','ti06',[0.60,0.82],'bottom',50);
    bgAction('text07','ti07',[0.68,0.90],'bottom',50);
    bgAction('text08','ti08',[0.76,1],'bottom',50);
    document.getElementById('text09').set=function(set,w,h,W,H){
        set.begin({
            per: 0.9,
            x: 0,
            y: H+h,
            opacity:0.6,
            scale:1
        }).end({
            per:1,
            x: 0,
            y: H-h,
            opacity: 1,
            scale:1
        });
    };


    document.getElementById('bird01').set = function(set,w,h,W,H){
        set.begin({
            per: 0.2,
            x: 0,
            y: 0.5*H-0.5*h,
            opacity:1
        }).end({
            per:0.4,
            x: W,
            y: 0,
            opacity:1
        });
    };
    document.getElementById('bird02').set = function(set,w,h,W,H){
        set.begin({
            per: 0.4,
            x: W,
            y: 0.5*H-0.5*h,
            opacity:1
        }).then({
            per: 0.401,
            x: W*0.84,
            y: (H-h)*0.43,
            opacity:0
        }).then({
            per: 0.43,
            x: W*0.84,
            y: (H-h)*0.43,
            opacity:0
        }).then({
            per: 0.431,
            x: W*0.70,
            y: (H-h)*0.36,
            opacity:1
        }).then({
            per: 0.46,
            x: W*0.70,
            y: (H-h)*0.36,
            opacity:1
        }).then({
            per: 0.461,
            x: W*0.56,
            y: (H-h)*0.29,
            opacity:0
        }).then({
            per: 0.49,
            x: W*0.56,
            y: (H-h)*0.29,
            opacity:0
        }).then({
            per: 0.491,
            x: W*0.42,
            y: (H-h)*0.22,
            opacity:1
        }).then({
            per: 0.52,
            x: W*0.42,
            y: (H-h)*0.22,
            opacity:1
        }).then({
            per: 0.521,
            x: W*0.28,
            y: (H-h)*0.15,
            opacity:0
        }).then({
            per: 0.55,
            x: W*0.28,
            y: (H-h)*0.15,
            opacity:0
        }).then({
            per: 0.551,
            x: W*0.14,
            y: (H-h)*0.08,
            opacity:1
        }).then({
            per: 0.58,
            x: W*0.14,
            y: (H-h)*0.08,
            opacity:1
        }).then({
            per:0.581,
            x: 0,
            y: 0,
            opacity:0
        }).end({
            per:0.6,
            x: 0,
            y: 0,
            opacity:0
        });
    };
    document.getElementById('bird03').set = function(set,w,h,W,H){
        set.begin({
            per: 0.4,
            x: W,
            y: (H-h),
            opacity:0
        }).then({
            per: 0.401,
            x: W*0.84,
            y: (H-h)*0.43,
            opacity:1
        }).then({
            per: 0.43,
            x: W*0.84,
            y: (H-h)*0.43,
            opacity:1
        }).then({
            per: 0.431,
            x: W*0.70,
            y: (H-h)*0.36,
            opacity:0
        }).then({
            per: 0.46,
            x: W*0.70,
            y: (H-h)*0.36,
            opacity:0
        }).then({
            per: 0.461,
            x: W*0.56,
            y: (H-h)*0.29,
            opacity:1
        }).then({
            per: 0.49,
            x: W*0.56,
            y: (H-h)*0.29,
            opacity:1
        }).then({
            per: 0.491,
            x: W*0.42,
            y: (H-h)*0.22,
            opacity:0
        }).then({
            per: 0.52,
            x: W*0.42,
            y: (H-h)*0.22,
            opacity:0
        }).then({
            per: 0.521,
            x: W*0.28,
            y: (H-h)*0.15,
            opacity:1
        }).then({
            per: 0.55,
            x: W*0.28,
            y: (H-h)*0.15,
            opacity:1
        }).then({
            per: 0.551,
            x: W*0.14,
            y: (H-h)*0.08,
            opacity:0
        }).then({
            per: 0.58,
            x: W*0.14,
            y: (H-h)*0.08,
            opacity:0
        }).then({
            per:0.581,
            x: 0,
            y: 0,
            opacity:1
        }).end({
            per:0.6,
            x: 0,
            y: 0,
            opacity:1
        });
    };
    document.getElementById('tree').set = function(set,w,h,W,H){
        set.begin({
            per: 0.6,
            x: -w,
            y: 0,
            opacity:.6
        }).then({
            per: 0.8,
            x: 0,
            y: 0,
            opacity:.6
        }).end({
            per:1,
            x: 0,
            y: 0,
            opacity:1
        });
    };

    var flowerAction=function(id){
        var el=document.getElementById(id);

        el.set = function(set,w,h,W,H){
            set.begin({
                per:.8,
                opacity:1,
                scale:0
            }).end({
                per:1,
                opacity:1,
                scale:1
            });
        };
    }

    flowerAction('flower01');
    flowerAction('flower02');
    flowerAction('flower03');
    flowerAction('flower04');
    flowerAction('flower05');
    flowerAction('flower06');

    //第三屏幕动画

    var tx00=document.getElementById('tx00');
    tx00.style.cssText=fadeCss(document.body.offsetHeight-tx00.offsetHeight,1)
    tx00.set=function(set,w,h,W,H){
        set.begin({
            per: 0,
            x: 0,
            y: H-h,
            opacity:1,
            scale:1
        }).end({per:0.2,
            x: 0,
            y: H-h,
            opacity: 0,
            scale:.95
        });
    };
    document.getElementById('tx01').set = function(set,w,h,W,H){
        set.begin({
            per: 0.1,
            y: H,
            opacity:1
        }).end({
            per:0.5,
            y: -h,
            opacity:1
        });
    };
    var ptAction=function(id,pArray){
        var el=document.getElementById(id);
        el.set=function(set,w,h,W,H){
            set.begin({
                per: pArray[0],
                scale:0.5,
                opacity:0.2
            }).then({
                per:pArray[1],
                scale:1,
                opacity:1
            }).end({
                per:pArray[2],
                scale:0.5,
                opacity:0.2
            });
        };
    }
    ptAction('pt01',[0.1,0.2,0.3]);
    ptAction('pt02',[0.15,0.25,0.35]);
    ptAction('pt03',[0.20,0.30,0.40]);
    ptAction('pt04',[0.30,0.4,0.5]);
    

    document.getElementById('boat').set=function(set,w,h,W,H){
        set.begin({
            per: 0.4,
            y: H-h,
            opacity:0.2
        }).end({
            per:0.7,
            y:H-h,
            opacity:1
        });
    };
    document.getElementById('p3boat').set=function(set,w,h,W,H){
        set.begin({
            per: 0.3,
            x:W+w,
            opacity:1
        }).end({
            per:0.7,
            x:-w,
            opacity:1
        });
    };
    var ptAction02=function(id,pArray){
        var el=document.getElementById(id);
        el.set=function(set,w,h,W,H){
            set.begin({
                per: pArray[0],
                y:H-h,
                opacity:0
            }).then({
                per:pArray[1],
                y:(H-h)*0.5,
                opacity:1
            }).end({
                per:pArray[2],
                y:(H-h)*0.4,
                opacity:0
            });
        };
    }
    ptAction02('pt05',[0.4,0.45,0.5]);
    ptAction02('pt06',[0.5,0.55,0.6]);
    ptAction02('pt07',[0.6,0.65,0.7]);

    document.getElementById('grass').set=function(set,w,h,W,H){
        set.begin({
            per: 0.7,
            y: H-h,
            opacity:0.8
        }).end({
            per:1,
            y:H-h,
            opacity:1
        });
    };
    document.getElementById('p3grass').set=function(set,w,h,W,H){
        set.begin({
            per: 0.7,
            rotate:0
        }).then({
            per:0.75,
            rotate:15
        }).then({
            per:0.8,
            rotate:0
        }).then({
            per:0.85,
            rotate:-15
        }).then({
            per:0.9,
            rotate:0
        }).then({
            per:0.95,
            rotate:15
        }).end({
            per:1,
            rotate:0
        });
    };
    ptAction02('pt08',[0.75,0.8,0.85]);
    ptAction02('pt09',[0.85,0.9,0.95]);
    ptAction02('pt10',[0.92,0.97,1]);


(function(mp3, musicbg){

    var audio = new Audio(mp3),
        audioHolder = document.createElement("a"),
        btn = new Image();
    audio.preload = true;
    audio.loop = "loop";
    audio.style.cssText = "display:none;";

    btn.src = musicbg;
    audioHolder.appendChild( audio );
    audioHolder.appendChild( btn );
    audioHolder.href="javascript:void(0);";
    audioHolder.onclick = function(e){
        e.stopPropagation();
        e.preventDefault();
        if(audio.paused){
            this.className = "audio-holder playing rotate";
            audio.play();
        }else{
            this.className = "audio-holder paused";
            audio.pause();
        }
    };
    
    playAudio = (function(){
        $("#container").appendChild(audioHolder);
        audio.play();
        setTimeout(function(){
            if( audio.paused ){
                audioHolder.className = "audio-holder paused";
            }else{
                audioHolder.className = "audio-holder playing rotate";
            }
        },1000);
    });

})("http://media.youban.com/gsmp3/mv20120713/134242537926732.mp3","images/musicbg.png");