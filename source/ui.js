/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var self2;

JSNES.DummyUI = function(nes) {
    this.nes = nes;
    this.enable = function() {};
    this.updateStatus = function() {};
    this.writeAudio = function() {};
    this.writeFrame = function() {};
};

function pleaseLoad(romToLoad) {
	document.getElementById("status-nes").className = romToLoad;
	self2.loadROM();
}

function fitScreen(width, height) {
	self2.screen.animate({
        	width: width + 'px',
        	height: height + 'px'
        });
}

function toggleSound() {
	self2.nes.opts.emulateSound = !self2.nes.opts.emulateSound;
}

if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.JSNESUI = function(roms) {
            var parent = this;
            var UI = function(nes) {
                var self = this;
                self.nes = nes;
				self2 = this;
                
                /*
                 * Create UI
                 */
                self.root = $('<div></div>');
                self.screen = $('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(self.root);
                
                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                
                self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.root);
                self.romSelect = $('<ul class="null" id="status-nes"></ul>').appendTo(self.romContainer);
                
                //self.controls = $('<div class="nes-controls"></div>').appendTo(self.root);
                //self.buttons = {
                    //pause: $('<input type="button" value="pause" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                    //restart: $('<input type="button" value="restart" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    //sound: $('<input type="button" value="enable sound" class="nes-enablesound">').appendTo(self.controls),
                    //zoom: $('<input type="button" value="zoom in" class="nes-zoom">').appendTo(self.controls)
                //};
                self.status = $('<p class="nes-status">Booting up...</p>').appendTo(self.root);
                self.root.appendTo(parent);
                
                /*
                 * ROM loading
                
                self.romSelect.change(function() {
                    self.loadROM();
                });
                
                
                 * Buttons
                
                self.buttons.pause.click(function() {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("Paused");
                        self.buttons.pause.attr("value", "resume");
                    }
                    else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "pause");
                    }
                });
        
                self.buttons.restart.click(function() {
                    self.nes.reloadRom();
                    self.nes.start();
                });
        
                self.buttons.sound.click(function() {
                    if (self.nes.opts.emulateSound) {
                        self.nes.opts.emulateSound = false;
                        self.buttons.sound.attr("value", "enable sound");
                    }
                    else {
                        self.nes.opts.emulateSound = true;
                        self.buttons.sound.attr("value", "disable sound");
                    }
                });
        
                self.buttons.zoom.click(function() {
                    if (self.zoomed) {
                        self.screen.animate({
                            width: '256px',
                            height: '240px'
                        });
                        self.buttons.zoom.attr("value", "zoom in");
                        self.zoomed = false;
                    }
                    else {
                        self.screen.animate({
                            width: '512px',
                            height: '480px'
                        });
                        self.buttons.zoom.attr("value", "zoom out");
                        self.zoomed = true;
                    }
                });
                
                
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
				self.zoomed = false;
                if ($.offset) {
                    self.screen.mousedown(function(e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function() {
                        setTimeout(function() {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }
            
                if (typeof roms != 'undefined') {
                    self.setRoms(roms);
                }
            
                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');
                
                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }
                
                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();
            
                /*
                 * Keyboard
                 */
                $(document).
                    bind('keydown', function(evt) {
                        self.nes.keyboard.keyDown(evt); 
                    }).
                    bind('keyup', function(evt) {
                        self.nes.keyboard.keyUp(evt); 
                    }).
                    bind('keypress', function(evt) {
                        self.nes.keyboard.keyPress(evt);
                    });
            
                /*
                 * Sound
                 */
                self.dynamicaudio = new DynamicAudio({
                    swf: nes.opts.swfPath+'dynamicaudio.swf'
                });
            };
        
            UI.prototype = {    
                loadROM: function() {
                    var self = this;
                    //self.updateStatus("Downloading...");
                    $.ajax({
						//type: 'GET',
						url: self.romSelect.attr("class"),
						//dataType: 'jsonp',
						//success: function() {console.log('Success!');},
						//error: function() {console.log('Come on!');},
						//jsonp: 'jsonp',
                        xhr: function() {
                            var xhr = $.ajaxSettings.xhr();
							//xhr.open("GET", self.romSelect.attr("class"), true);
							//xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
							//xhr.setRequestHeader('X-PINGOTHER', 'pingpong');
							//xhr.setRequestHeader('Content-Type', 'application/xml');
							//xhr.onreadystatechange = function () {
							//	if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
							//		console.log(xhr.responseText);
							//	}
							//};
							//xhr.send(null);
                            if (typeof xhr.overrideMimeType !== 'undefined') {
                                // Download as binary
                                xhr.overrideMimeType('text/plain; charset=x-user-defined');
                            }
                            self.xhr = xhr;
                            return xhr;
                        },
                        complete: function(xhr, status) {
                            var i, data;
                            if (JSNES.Utils.isIE()) {
                                var charCodes = JSNESBinaryToArray(
                                    xhr.responseBody
                                ).toArray();
                                data = String.fromCharCode.apply(
                                    undefined, 
                                    charCodes
                                );
                            }
                            else {
                                data = xhr.responseText;
                            }
                            self.nes.loadRom(data);
                            self.nes.start();
                            self.enable();
                        }
                    });
                },
                
                resetCanvas: function() {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },
                
                /*
                *
                * nes.ui.screenshot() --> return <img> element :)
                */
                screenshot: function() {
                    var data = this.screen[0].toDataURL("image/png"),
                        img = new Image();
                    img.src = data;
                    return img;
                },
                
                /*
                 * Enable and reset UI elements
                 */
                enable: function() {
                    this.buttons.pause.attr("disabled", null);
                    if (this.nes.isRunning) {
                        this.buttons.pause.attr("value", "pause");
                    }
                    else {
                        this.buttons.pause.attr("value", "resume");
                    }
                    this.buttons.restart.attr("disabled", null);
                    if (this.nes.opts.emulateSound) {
                        this.buttons.sound.attr("value", "disable sound");
                    }
                    else {
                        this.buttons.sound.attr("value", "enable sound");
                    }
                },
            
                updateStatus: function(s) {
                    this.status.text(s);
                },
        
                setRoms: function(roms) {
                    this.romSelect.children().remove();
                    //$("<p>Select a ROM...</p>").appendTo(this.romSelect);
                    for (var groupName in roms) {
                        if (roms.hasOwnProperty(groupName)) {
                            var optgroup = $('<p></p>').
                                attr("label", groupName);
                            for (var i = 0; i < roms[groupName].length; i++) {
								//console.log(roms[groupName][i][1]);
                                //$('<li onclick="pleaseLoad(className);">'+roms[groupName][i][0]+'</li>')
                                    //.attr("class", roms[groupName][i][1])
                                    //.appendTo(optgroup);
                            }
                            this.romSelect.append(optgroup);
                        }
                    }
                },
            
                writeAudio: function(samples) {
                    return this.dynamicaudio.writeInt(samples);
                },
            
                writeFrame: function(buffer, prevBuffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;

                    for (i=0; i<256*240; i++) {
                        pixel = buffer[i];

                        if (pixel != prevBuffer[i]) {
                            j = i*4;
                            imageData[j] = pixel & 0xFF;
                            imageData[j+1] = (pixel >> 8) & 0xFF;
                            imageData[j+2] = (pixel >> 16) & 0xFF;
                            prevBuffer[i] = pixel;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                }
            };
        
            return UI;
        };
    })(jQuery);
}
