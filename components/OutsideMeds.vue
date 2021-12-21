<template>
    <b-container style="display:inline">
        <b-button variant="primary" size="sm" class="float-right mr-5" @click="$bvModal.show('outsidemed-list-modal')">Outside Medications</b-button>        
        <b-modal id="outsidemed-list-modal"
            button-size="sm"
            centered hide-footer no-close-on-backdrop scrollable
            title="Outside Medications" header-bg-variant="primary">
            <b-row>
                <b-col cols="12" class="text-info font-weight-lighter mb-2">
                    This is the list of medications entered by clinicians. This information is stored in SEAL and not in EPIC.
                </b-col>
            </b-row>                        
            <b-row>
                <b-col>
                    <b-table :items="outsideMeds" striped small
                        :fields="[{label:'', key: 'action'}, {label: 'Medication', key: 'med_name'}]">
                        <template #head(action)="data">
                            <b-icon icon="plus" class="rounded-circle ml-1 bg-secondary" 
                                font-scale="1.5" @click="editOutsideMed({})" title="Add" />
                        </template>                        
                        <template #cell(med_name)="data">
                            {{data.item.med_name}}
                        </template>
                        <template #cell(action)="data">
                            <b-icon icon="pencil" class="rounded-circle ml-1" title="Edit"
                                font-scale="1.2" @click="editOutsideMed(data.item)" />
                            <b-icon icon="trash" class="rounded-circle ml-2"  title="Delete"
                                font-scale="1.2" @click="deleteOutsideMed(data.item)" />
                        </template>
                    </b-table>
                </b-col>
            </b-row>
        </b-modal>

        <b-modal id="outsidemed-edit-modal" button-size="sm" size="lg" 
            centered hide-footer no-close-on-backdrop 
            title="Outside Medications" header-bg-variant="primary">
            <b-row>
                <b-col class="text-right" cols="2">
                    <label for="startDate">Med Name</label>
                </b-col>                
                <b-col cols="9">
                    <b-form-input type="text" v-model="chosenOutsideMed.med_name" />
                </b-col>
            </b-row>
            <b-row>
                <b-col class="text-right" cols="2">
                    <label for="startDate">Notes</label>
                </b-col>                
                <b-col cols="9">
                    <b-form-textarea v-model="chosenOutsideMed.med_note" rows="3" class="mt-2" />
                </b-col>
            </b-row>
            <b-row class="mt-2">
                <b-col cols="2">
                    <label for="startDate">Pharma Class</label>
                </b-col>
                <b-col cols="4">
                    <b-form-input type="text" v-model="chosenOutsideMed.pharma_class" size="sm"/>
                </b-col>
                <b-col cols="5">
                    <b-row>
                        <b-col cols="4">
                            <label for="startDate">Thera Class</label>
                        </b-col>
                        <b-col cols="8">
                            <b-form-input type="text" v-model="chosenOutsideMed.thera_class" size="sm"/>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>
            <b-row class="mt-2">
                <b-col cols="2">
                    <label for="startDate">Route</label>
                </b-col>
                <b-col cols="4">
                    <b-form-input type="text" v-model="chosenOutsideMed.route" size="sm"/>
                </b-col>
                <b-col cols="5">
                    <b-row>
                        <b-col cols="4">
                            <label for="startDate">Ingredients</label>
                        </b-col>
                        <b-col cols="8">
                            <b-form-input type="text" v-model="chosenOutsideMed.ingredients" size="sm"/>
                        </b-col>
                    </b-row>
                </b-col>
            </b-row>               
            <b-row v-if="chosenOutsideMed.seal_medication_id > -1">
                <b-col class="text-right" cols="2">
                    <label for="startDate">Audit Info</label>
                </b-col>                
                <b-col cols="9">
                    <div style="font-size:small" class="mt-1">
                        Created by {{chosenOutsideMed.created_by_name}} at {{chosenOutsideMed.created_dttm_str}}
                        <span class="ml-3">Updated by {{chosenOutsideMed.created_by_name}} at {{chosenOutsideMed.created_dttm_str}}</span>
                    </div>
                </b-col>
            </b-row> 
            <b-row class="mt-2">
                <b-col cols="12">
                    <b-table
                        :items="chosenOutsideMed.med_periods"
                        :fields="[{label:'', key: 'action'}, {label:'Start Date', key: 'start_date'}, {label:'End Date', key: 'end_date'}, {label:'Type', key: 'ptype'}]"
                        head-row-variant="primary"                        
                        small striped
                        >
                        <template #head(action)="data">
                            <b-icon icon="plus" class="rounded-circle ml-1 bg-secondary" 
                                font-scale="1.5" @click="addOutsideMedPeriod" title="Add" />
                        </template>
                        <template #cell(action)="data">
                            <b-icon icon="trash" class="rounded-circle ml-1" 
                                font-scale="1.2" @click="deleteOutsideMedPeriod(data.index)" title="Delete" />
                        </template>                        
                        <template #cell(start_date)="data">
                            <editable-date-picker v-model="data.item.start_date" />
                        </template>
                        <template #cell(end_date)="data">
                            <editable-date-picker v-model="data.item.end_date" />                                
                        </template>
                        <template #cell(ptype)="data">
                            <b-select v-model="data.item.ptype" :options="['Inpatient', 'Outpatient']" size="sm"/>
                        </template>
                    </b-table>                  
                </b-col>
            </b-row>
            <b-row>
                <b-col cols="12" class="text-info font-weight-lighter">
                    Reminder: Data entered here is NOT saved in Epic. 
                </b-col>
            </b-row> 
            <b-row>
                <b-col cols="12" class="text-right">
                    <b-button variant="primary" rounded size="sm" @click="$bvModal.hide('outsidemed-edit-modal')">Close</b-button>
                    <b-button variant="primary"  rounded size="sm" @click="saveOutsideMed()">Save</b-button>
                    <!--
                    <b-button variant="primary" rounded size="sm" @click="deleteSealCondition()" 
                        v-if="(chosenOutsideMed.seal_medication_id > -1)">Delete</b-button>
                    -->
                </b-col>
            </b-row>            
        </b-modal>    
    </b-container>     
</template>

<script>
export default {
    props : {
        value: undefined
    }, 
    data () {
        return {        
            outsideMeds: [],
            patient: {},
            chosenOutsideMed: { 
                name: '', 
                notes: '',
                created_by_name: 'Srinivasan Boosi',
                updated_by_name: 'Ron Li',
                created_dttm_str: '10/10/2020 10:10 AM',
                updated_dttm_str: '10/10/2020 10:10 AM',
                med_periods: [
                    {start_date: '10/10/2020', end_date: '11/20/2020', ptype: 'Inpatient'},     
                    {start_date: '12/10/2020', end_date: '12/20/2020', ptype: 'Outpatient'}
                ]
            }            
        } ;
    },
    mounted() {
        console.log("*****Mounted OutsideMeds Component*********") ;
        console.log(this.value) ;          
        this.outsideMeds = this.value.cmeds ;
        console.log(this.outsideMeds) ;
    },
    watch: {
        value: function(newValue) {
            console.log("**********In watch patient newvalue {}", newValue) ;
            this.outsideMeds = this.value.cmeds ;
        }
    },
    methods : {        
        editOutsideMed(omed) {
            console.log("Inside the outsidemed edit method...")
            console.log(omed) ;
            this.chosenOutsideMed = JSON.parse(JSON.stringify(omed)) ; // clone
            if (!this.chosenOutsideMed.med_periods) {
                this.$set(this.chosenOutsideMed, 'med_periods', []) ;                
            }
            this.$bvModal.show('outsidemed-edit-modal') ;
        },
        async saveOutsideMed() {
            console.log("save outside med {}", this.chosenOutsideMed) ;
            var response = await this.$services.medreview.saveOutsideMed(this.chosenOutsideMed) ;
            //console.log("ajax save omed  response {}", response) ;
            if (this.chosenOutsideMed.seal_medication_id > 0) {
                var idx = this.outsideMeds.findIndex(omed => omed.seal_medication_id == this.chosenOutsideMed.seal_medication_id) ;
                console.log("got the index to update " + idx) ;
                this.$set(this.outsideMeds, idx, this.chosenOutsideMed) ;                
            } else {                
                this.chosenOutsideMed.seal_medication_id = response.seal_medication_id ;                
                this.outsideMeds.push(this.chosenOutsideMed) ;
            }
            this.$set(this.value, 'cmeds', this.outsideMeds) ;
            console.log("Emitting input event for " + JSON.stringify(this.value)) ; 
            this.$emit('change', this.value) ;
            this.$emit('input', this.value) ;
            this.$bvModal.hide('outsidemed-edit-modal') ;
        },
        async deleteOutsideMed(omed) {
            this.$bvModal.msgBoxConfirm('Are you sure to delete this medication - "' + omed.med_name + '" ?', {
                title: 'Confirm Delete',
                size: 'sm',
                buttonSize: 'sm',
                okVariant: 'danger',
                okTitle: 'YES',
                cancelTitle: 'NO',
                footerClass: 'p-2',
                hideHeaderClose: false,
                centered: true
            })
            .then(value => {
                console.log("confirm dialong return value :" + value) ;
                if (!value) return ;

                omed.action = "delete" ;
                console.log("In delete seal medication {} ", omed) ;            
                                
                this.$services.medreview.saveOutsideMed(omed).then (response => {
                    console.log("deleted {}", response) ;
                    var idx = this.outsideMeds.findIndex(omed1 => omed1.seal_medication_id == omed.seal_medication_id) ;
                    this.outsideMeds.splice(idx, 1) ;   
                    this.$set(this.value, 'cmeds', this.outsideMeds) ;                 
                    this.$emit("change", this.value) ;
                    this.$emit("deleted", omed.seal_medication_id) ;
                    this.$bvModal.hide('outsidemed-edit-modal') ; 
                }) ;

            }) ;
        },
        deleteOutsideMedPeriod(idx) {
            console.log("Deleting Med Period idx: " + idx) ;
            console.log(JSON.stringify(this.chosenOutsideMed.med_periods)) ;
            this.chosenOutsideMed.med_periods.splice(idx, 1) ;
        },
        addOutsideMedPeriod() {
            this.chosenOutsideMed.med_periods.splice(0, 0, {start_date: "", end_date:""}) ;
            console.log("after adding row") ;
            console.log(JSON.stringify(this.chosenOutsideMed.med_periods)) ;
        }
    }
}
</script>