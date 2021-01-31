$(document).ready(function(){
    var counter = 0;
    const updateRate = 10;

    function Mouse () {
        this.ox = 0;
        this.oy = 0;
        this.x = 0;
        this.y = 0;
    }

    Mouse.prototype.show = function() {
        return '(' + this.x + ', ' + this.y + ')';
    }

    Mouse.prototype.updatePosition = function (that, event) {
        this.x = event.pageX - $(that).offset().left - $(that).innerWidth()/2;
        this.y = (event.pageY - $(that).offset().top - $(that).innerHeight()/2) * -1;
    }

    var mouse = new Mouse();

    function isTimeToUpdate () {
        return ( (counter++) % updateRate ) === 0;
    };

    function updateTransformStyle (that, x, y) {
        style = "rotateX(" + x*2 + "deg) rotateY(" + y*2 + "deg)";
        $(that).css('transform', style);
    };

    function update (that,event) {
        mouse.updatePosition(that,event);
        inner = $(that).children('.inner3d');
        updateTransformStyle(
            inner,
            (mouse.y / $(inner).innerHeight()/2).toFixed(2),
            (mouse.x / $(inner).innerWidth()/2).toFixed(2)
        );
    };


    $('.envelope3d').mouseenter( function(event) {
        counter = 0;
        update(this,event);
    });

    $('.envelope3d').mouseleave( function() {
        $(this).children('.inner3d').removeAttr('style');
        counter = 0;
    });

    $('.envelope3d').mousemove( function(event) {
        if (isTimeToUpdate()) {
            update(this,event);
        }
    });

    var current = 0;
    function changeSuggestions(direction = 1, repeatCall = true) {
        $('.sug' + current).css('opacity',0);
        $('.sug' + current).css('z-index',-1);

        if (direction == -1) {
          current = (current - 1 + 3) % 3;
        } else {
          current = (current + 1) % 3;
        }
        $('.sug' + current).css('opacity',1);
        $('.sug' + current).css('z-index',0);

        if (repeatCall) {
          setTimeout(changeSuggestions, 10000);
        }
    }
    setTimeout(changeSuggestions, 10000);

    $('button[name="previousButton"]').on("click", function(event) {
      changeSuggestions(-1, false);
    });

    $('button[name="nextButton"]').on("click", function(event) {
      changeSuggestions(1, false);
    });
});
