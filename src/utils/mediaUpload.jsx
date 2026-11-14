import { createClient } from '@supabase/supabase-js';

const anonKey="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlza2huYmF5emNuY3B2bWN3YmNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODU0NjcsImV4cCI6MjEwMzE2MTQ2N30.uIK2_RowtXWSyUw9vV8lBkCDjeXb0Bbbb7IScliTxho"
const supabaseUrl="https://yskhnbayzcncpvmcwbcq.supabase.co"

const supabase = createClient(supabaseUrl, anonKey)



export default function mediaUpload(file){

    return new Promise(
        (resolve,reject)=>{

            if(file==null){
                reject("No file selected")
            }

            else{
                const timestamp = new Date().getTime()
                
                const fileName = timestamp + file.name

                supabase.storage.from("images").upload(fileName, file, {
                    upsert: false,
                    cacheControl: "3600",
                }).then(
                    ()=>{
                    const publicUrl = supabase.storage.from("images").getPublicUrl(fileName).data.publicUrl
                    console.log(publicUrl)
                    resolve(publicUrl)
                }).catch(
                    ()=>{
                        reject("Error uploading file")
                    }
                )
            }
        }
    )
}