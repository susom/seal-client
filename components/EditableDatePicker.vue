<template>
    <b-container class="nomargin">
        <b-input-group>
            <b-form-input
                v-model="inp_start_date"                            
                type="text"
                placeholder="MM/DD/YYYY"
                autocomplete="off"
                size="sm"
                @change="startDateChange"                        
            ></b-form-input>
            <b-input-group-append>
                <b-form-datepicker
                    v-model="start_date"
                    button-only                            
                    :date-format-options="{ month: 'numeric', day: 'numeric', year: 'numeric' }"
                    locale="en-US"                        
                    size="sm"
                    aria-controls="start_date"                                
                    hide-header
                    close-button
                    no-flip                                
                    @context="startDatePickerChange"                         
                ></b-form-datepicker>
            </b-input-group-append>
            <b-form-invalid-feedback :state="error">Specify date in mm/dd/yyyy format.</b-form-invalid-feedback>                        
        </b-input-group>
    </b-container>
</template>

<script>
export default {
    props : { 
        value : '',
        required: false
    }, 
    data () {
        return {
            start_date: '',
            inp_start_date: '',
            error: true
        }
    },
    mounted () {
        
        this.inp_start_date = this.value ;
        if (this.inp_start_date && this.inp_start_date != '') 
            this.start_date = this.$moment(this.inp_start_date, "MM/DD/YYYY").format("YYYY-MM-DD") ;
        
    },
    watch: {
        value: function(newValue) {
            this.inp_start_date = newValue ;
            if (this.inp_start_date && this.inp_start_date != '') 
                this.start_date = this.$moment(this.inp_start_date, "MM/DD/YYYY").format("YYYY-MM-DD") ;                         
        }
    },    
    methods: {
        startDateChange() {
            if (this.inp_start_date == '') {
                this.error = !this.required ; //true ;
                this.$emit('input', this.inp_start_date) ;
                this.$emit('error', this.error) ;                
                return ;
            }
            var noidea = this.$moment(this.inp_start_date, "MM/DD/YYYY") ;                        

            if (noidea.isValid()) {
                this.start_date = noidea.format("YYYY-MM-DD") ;
                if (this.inp_start_date != this.$moment(this.start_date, "YYYY-MM-DD").format("MM/DD/YYYY")) 
                    this.inp_start_date = this.$moment(this.start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
                this.error = true ;
                this.$emit('input', this.inp_start_date) ;
            } else {
                this.error = false ;
                console.log("Invalid start date") ;
                //this.$emit('input', '') ;
            }
            this.$emit('error', this.error) ;
        },
        startDatePickerChange() {            
            if (this.start_date && this.start_date != '') {
                this.inp_start_date = this.$moment(this.start_date, "YYYY-MM-DD").format("MM/DD/YYYY") ;
                this.error = true ;
                this.$emit('input', this.inp_start_date) ;
                this.$emit('error', this.error) ;
            }
        }
    }
}
</script>

<style scoped>
    .nomargin {
        margin-left: 0px;
        margin-right: 0px;
        padding-left: 0px;
        padding-right: 0px;
    }
</style>