<template>
    <b-row v-if="systemError || loadingMessage">
        <b-col cols="12"  class="text-center">
            <b-button variant="info" disabled size="sm" class="mt-3" style="width:100%">
                <b-spinner v-if="!systemError" small type="grow" class="mr-2"></b-spinner>
                <b-icon v-if="systemError" icon="exclamation-triangle" class="mr-2"></b-icon>
                <span v-if="systemError">
                    System Error in processing your request...
                </span>
                <span v-else>
                    {{ loadingMessage }}
                </span>
            </b-button>
        </b-col>
        <b-col cols="12" class="text-center mt-2 mb-2" style="color:red;font-size:1.2em" v-if="systemError">
            We encountered a system error while processing your request. The issue has been logged and we will let you know once it has been resolved.
        </b-col>
    </b-row> 
</template>

<script type="javascript">
export default {
    props: { 
        loadingMessage: '',
        systemError: false 
    },
    data () {
        return {
            
        }
    }
}
</script>