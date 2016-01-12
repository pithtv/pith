(function(window, angular){
    'use strict';

    angular.module('ptScrollModule', []).directive('ptScroll', [function() {
        return {
            restrict: 'A',
            scope: true,
            link: function($scope, element, attrs) {
                if(!window.navigator.standalone) {
                    // not necessary unless we're standalone in iOS
                    $scope.$scrollhack = false;
                    return;
                }

                $scope.$scrollhack = true;

                element.addClass("scrollwrapper");
                $("body").addClass("fakescroll")

                var scrollX = 0, scrollY = 0;

                function scrollBy(x,y) {
                    scrollTo(scrollX + x, scrollY + y);
                }

                function scrollTo(x,y) {
                    scrollX = Math.max(0, x); scrollY = Math.max(0, y);
                    //element.css('transform', 'translate(' + (-1 * scrollX) + 'px, ' + (-1 * scrollY) + 'px)');
                    element.scrollTop(scrollY);
                }

                function getScrollPosition() {
                    return { left: scrollX, top:scrollY };
                }

                // sets up touch scrolling
                var self = this,
                    tracking = false, // keep tracking of whether we're currently tracking touch or not
                    lastX, lastY,
                    timeUnit = 100, // 100ms
                    inertialCutOff = 0.001, // minimum speed for inertial scrolling before cutoff
                    inertia = 0.998, // inertia for inertial scrolling (higher means longer scrolling, 1 = infinite (frictionless) scrolling, 0 = no inertial scrolling)
                // scroll speed is multiplied by this factor for each millisecond that passes

                    eventQueue = []; // keep track of last 100ms of events to determine drag speed

                function pruneEventQueue() {
                    // remove all eventQueue entries older than <timeUnit> milliseconds
                    var t = eventQueue[0].t;
                    for(var x=1,l=eventQueue.length;x<l;x++) {
                        if( (t - eventQueue[x].t) > timeUnit ) break;
                    }
                    eventQueue = eventQueue.slice(0, x);
                }

                function startInertialScroll(speedX, speedY) {
                    var previousTime = new Date().getTime();

                    var scrollPosition = getScrollPosition();

                    function draw() {
                        if(tracking) return; // if tracking a new touch thing, stop inertial scrolling

                        var t = new Date().getTime();
                        var frameDuration = t - previousTime;
                        previousTime = t;

                        var r = Math.pow(inertia, frameDuration);
                        speedX = speedX * r; // adjust speed according to drag
                        speedY = speedY * r;

                        if(Math.abs(speedX) >= inertialCutOff && Math.abs(speedY) >= inertialCutOff) {
                            // not doing relative scrolling because that looses a lot of precision
                            scrollPosition.left += speedX * frameDuration;
                            scrollPosition.top += speedY * frameDuration;
                            scrollTo(Math.round(scrollPosition.left), Math.round(scrollPosition.top));

                            // request next frame.
                            requestAnimationFrame(draw);
                        }
                    };

                    requestAnimationFrame(draw);
                }

                element.on("touchstart", function(startevent) {
                    // user touches screen, so we may have to start scrolling
                    lastX = startevent.originalEvent.touches[0].pageX, lastY = startevent.originalEvent.touches[0].pageY;
                }).on("touchmove", function(dragevent) {
                    if(!tracking) {
                        tracking = true;
                    }
                    if(tracking) { // probably a pointless test since we shouldn't be getting a touchmove event unless we got a touchstart first anyway, but still
                        var newX = dragevent.originalEvent.touches[0].pageX, newY = dragevent.originalEvent.touches[0].pageY;

                        var dX = lastX - newX, dY = lastY - newY;

                        var e = {
                            x: dX,
                            y: dY,
                            t: new Date().getTime()
                        };

                        eventQueue.unshift(e);
                        pruneEventQueue();

                        lastX = newX;
                        lastY = newY;

                        scrollBy(dX, dY);

                        dragevent.stopPropagation();
                        dragevent.preventDefault();
                    }
                }).on("touchend", function(endevent) {
                    if(tracking) {
                        tracking = false;

                        if(!eventQueue.length) return;

                        var timeSinceLastEvent = (new Date().getTime()) - eventQueue[0].t;
                        if(timeSinceLastEvent < timeUnit) {
                            var delta = eventQueue.reduce(function(a,b) {
                                a.dX += b.x;
                                a.dY += b.y;
                                return a;
                            }, { dX: 0, dY: 0 });

                            var timeBetween = eventQueue[0].t - eventQueue[eventQueue.length-1].t;

                            startInertialScroll(delta.dX / timeBetween, delta.dY / timeBetween);
                        }

                        eventQueue = [];

                        endevent.stopPropagation();
                        endevent.preventDefault();
                    }
                }).on("wheel", function(wheelevent) {
                    scrollBy(wheelevent.originalEvent.deltaX,wheelevent.originalEvent.deltaY);
                    wheelevent.preventDefault();
                });

                setTimeout(function() {
                    window.scrollTo(0,10);

                    $(window).on('scroll', function(evt) {
                        if(window.scrollY == 0) {
                            scrollTo(0,0);
                            window.scrollTo(0,10);
                        }
                    });
                }, 100);
            }
        };
    }]);

})(window, window.angular);