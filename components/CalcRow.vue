<template>
    <v-container>
        <v-row v-for="row in rows" :key="row.text">
            <v-col cols="5">
                {{row.text}}
            </v-col>
            <v-col>
                <v-chip-group dense @change="onChoiceChange" v-model="row.value" color="primary" mandatory>
                    <v-chip v-for="btn in row.buttons" :key="btn.text" rounded :value="btn.points" class="mr-3">
                        {{btn.text}} (+{{btn.points}})
                    </v-chip>                    
                    <v-chip :value="minusOne" rounded hidden class="mr-3" style="display:none">-1</v-chip>
                </v-chip-group>
                <!--
                <v-btn-toggle dense @change="onChoiceChange" v-model="row.value" color="primary" mandatory>
                    <v-btn v-for="btn in row.buttons" :key="btn.text" rounded :value="btn.points" class="mr-3">
                        {{btn.text}} (+{{btn.points}})
                    </v-btn>
                    <v-btn :value="minusOne" rounded hidden class="mr-3" style="display:none">-1</v-btn>
                </v-btn-toggle>
                -->
            </v-col>
        </v-row>    
    </v-container>
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
    methods : {
        
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
                var btn = btnRow.buttons.find(btn => btn.text === buttonText) ;
                if (btn) {
                    btnRow.value = btn.points ;
                }
            }
        }
    }
}
</script>

<style scoped>
    * {
        text-transform: none !important;
    }
</style>