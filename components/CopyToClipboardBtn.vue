<template>
    <div>
        <b-btn @click="copyToClipboard()" variant="primary" size="sm" class="mb-2">{{label}}</b-btn>
        <span class="pl-3" style="font-size:small">{{copyBtnInfo}}</span>    
    </div>
</template>
<script>
export default {
    props : { 
        label : '',
        content: ''
    }, 
    data () {
        return {
            copyBtnInfo: ''
        }
    },
    mounted () {
        console.log("In CopyToClipboard - mounted") ;        
        //console.log(this.content) ;
    },
    methods: {
        copyToClipboard() {   
            console.log('In copytoclipboard content:' + this.content) ;
            var mesg = 'Result copied to clipboard.' ;
            try {
                if (window.clipboardData) {
                    window.clipboardData.setData('Text', this.content);            
                } else {
                    var textArea = document.createElement('textarea');
                    // Place in the top-left corner of screen regardless of scroll position.
                    textArea.style.position = 'fixed';
                    textArea.style.top = 0;
                    textArea.style.left = 0;

                    // Ensure it has a small width and height. Setting to 1px / 1em
                    // doesn't work as this gives a negative w/h on some browsers.
                    textArea.style.width = '2em';
                    textArea.style.height = '2em';

                    // We don't need padding, reducing the size if it does flash render.
                    textArea.style.padding = 0;

                    // Clean up any borders.
                    textArea.style.border = 'none';
                    textArea.style.outline = 'none';
                    textArea.style.boxShadow = 'none';

                    // Avoid flash of the white box if rendered for any reason.
                    textArea.style.background = 'transparent';
                    

                    document.body.appendChild(textArea);
                    textArea.value = this.content ;
                    textArea.focus();
                    textArea.select();

                    var result = document.execCommand('copy');
                    if (result === 'unsuccessful') {
                        console.error('Failed to copy text.');
                    } else {
                        console.log("successfully copied the text to clipboard :" + this.content) ;
                    }
                    textArea.remove();                    
                }
                
                /*
                else if (navigator.clipboard) {                    
                    navigator.clipboard.writeText(this.content).then(function() {
                        console.log("success") ;
                    }, function(err) {
                        console.log("error in clipboard :" + err) ;
                        mesg = "Error in clipboard copy :" + err ;
                    })
                } else {
                    mesg = "windows.clipboarddata or navigator.clipboard doesn't exist." ;
                }
                */
            } catch (err) {
                mesg = "Error in copy :" + err ;
            }
            this.copyBtnInfo = mesg ;
            var _self = this ;
            window.setTimeout(function() { _self.copyBtnInfo = "" ; }, 2000) ;
        }
    }
}
</script>