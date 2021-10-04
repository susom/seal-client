<template>
    <b-container class="mb-3">
        <b-row  v-for="(row, rowIdx) in rows" :key="row.text" class="mt-4">
            <b-col cols="6">
                {{row.text}}
            </b-col>
            <b-col>
                <b-button-group size="sm" id="calcBtns">
                    <b-button pill v-for="(btn, btnIdx) in row.buttons" :key="btn.text" pressed
                        :variant="getVariant(rowIdx, btnIdx)" @click="chooseButton(rowIdx, btnIdx)" class="mr-3 smallfont"
                        :style="{width: parseInt(250/row.buttons.length) + 'px'}">
                        {{btn.text}} (+{{btn.points}})
                    </b-button>
                </b-button-group>
            </b-col>
        </b-row>
    </b-container>
</template>

<script>
export default {
    /*
            rows1 : [
                { text: "Age", buttons : [ { text: "< 65", points: 0}, {text: "65-74", points: 1}, { text: ">= 75", points: 2} ] },
                { text: "Sex", buttons : [ { text: "Female", points: 1}, {text: "Male", points: 0} ] },
                { text: "CHF History", buttons : [ { text: "No", points: 0}, {text: "Yes", points: 1} ] }
            ],
    */    
    props : { 
        rows : Array 
    } , 
    data () {
        return {
            totalPoints: 0,
            mandatory: true,
            minusOne: -1
        }
    },
    mounted () {
        //console.log("calcrow - mounted") ;
        this.rows.forEach(row => {
            if (row.value == undefined)
                row.value = -1 ;
        }) ;                
        //console.log(this.rows) ;
    },
    computed : {

    },
    methods : {
        getVariant(rowIdx, btnIdx) {
          if (this.rows[rowIdx].value == this.rows[rowIdx].buttons[btnIdx].points) {
            return "primary" ;
          } else {
            return "secondary" ;
          }
        },
        chooseButton(rowIdx, btnIdx) {
            this.rows[rowIdx].value = this.rows[rowIdx].buttons[btnIdx].points ;

            this.totalPoints = 0 ;

            for (var i=0;i<this.rows.length;i++) {
                var row = this.rows[i] ;
                if (row.value == -1) {
                    this.totalPoints = -1 ;
                    break ;
                } else {
                    this.totalPoints = this.totalPoints + row.value ;
                    //this.totalPoints = this.totalPoints + row.buttons[row.value].points ;
                }
            }
            if (this.totalPoints > -1)
                this.$emit('input', this.totalPoints)    ;            
        },
        onChoiceChange(event) {

            this.totalPoints = 0 ;

            for (var i=0;i<this.rows.length;i++) {
                var row = this.rows[i] ;
                if (row.value == -1) {
                    this.totalPoints = -1 ;
                    break ;
                } else {
                    this.totalPoints = this.totalPoints + row.value ;
                }
            }
            if (this.totalPoints > -1)
                this.$emit('input', this.totalPoints)    ;
        },

        selectButton(rowText, buttonText) {
            var btnRow = this.rows.find(row => row.text === rowText) ;
            if (btnRow) {
                for (var btnIdx = 0 ; btnIdx < btnRow.buttons.length; btnIdx++) {
                    if (btnRow.buttons[btnIdx].text === buttonText) {
                        btnRow.value = btnRow.buttons[btnIdx].points ;
                        break ;
                    }
                }
            }
        },

        resetRiskCategory(rowText) {
            var btnRow = this.rows.find(row => row.text === rowText) ;
            btnRow.value = -1 ;
        }
    }
}
</script>

<style>
    #calcBtns .btn {
        padding-top: .1em;
        padding-bottom: .1em;
        font-size: 0.85em;         
    }
</style>
<style scoped>
    * {
        text-transform: none !important;
    }
</style>