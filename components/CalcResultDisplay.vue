<template>
    <table>
        <thead>
            <tr>
                <th  class="text-h6 text-center" v-for="row in rows" :key="row.text" >
                    <span v-html="row.text"></span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td  class="text-h6 text-center" v-for="row in rows" :key="row.text">
                    {{row.value}}
                </td>
            </tr>
        </tbody>                                    
    </table>
</template>

<script>
export default {
    /*
            rows1 : [
                { text: "Total Score", value: "10 points" },
                { text: "Risk Cateogry", value: "High" } }
            ],
    */    
    props : { 
        rows : Array 
    } , 
    data () {
        return {
            totalPoints: 0
        }
    },
    mounted () {
        console.log("calc disp result - mounted") ;
    },
    methods : {

    }
}
</script>

<style scoped>
    table {
        margin-top:10px;
        padding:5px;
        border-collapse: collapse;
        width: 95% ;
    }
    th, td {        
        padding:5px;        
        border: 1px solid black;        
    }
    th:first-of-type {
        width: 20% ;
    }
</style>