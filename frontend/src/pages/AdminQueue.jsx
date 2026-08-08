import { useEffect, useState } from "react";


function AdminQueue(){


    const [queue,setQueue] = useState([]);



    useEffect(()=>{

        fetchQueue();

    },[]);




    const fetchQueue = async()=>{


        const token = localStorage.getItem("token");


        try{


            const response = await fetch(

                "https://smartqueue-backend-vjuh.onrender.com/api/appointment/admin/queue",

                {

                    method:"GET",

                    headers:{

                        "Authorization":`Bearer ${token}`

                    }

                }

            );



            const data = await response.json();


            console.log(data);



            if(response.ok){

                setQueue(data.queue);

            }



        }
        catch(error){

            console.log(error);

        }


    };





    return(


        <div>


            <h2>
                Admin Queue Management
            </h2>



            {
                queue.length === 0 ?


                (

                    <p>
                        No patients in queue
                    </p>


                )


                :


                (

                    <>


                    <h3>
    Current Serving Token:
    {queue[0].tokenNumber}
</h3>


<button
    onClick={serveNext}
>
    Serve Next Patient
</button>



                    <hr />



                    <h3>
                        Waiting Queue
                    </h3>




                    {
                        queue.map((appointment,index)=>(


                            <div key={appointment._id}>


                                <h4>

                                    Token Number:
                                    {appointment.tokenNumber}

                                </h4>


                                <p>

                                    Date:
                                    {appointment.date}

                                </p>



                                <p>

                                    Status:
                                    {appointment.status}

                                </p>


                                <hr/>


                            </div>


                        ))

                    }


                    </>

                )

            }



        </div>


    );


}

const serveNext = async()=>{


    const token = localStorage.getItem("token");


    const response = await fetch(

        "https://smartqueue-backend-vjuh.onrender.com/api/appointment/admin/serve-next",

        {

            method:"PUT",

            headers:{

                "Authorization":`Bearer ${token}`

            }

        }

    );


    const data = await response.json();


    console.log(data);


    fetchQueue();
    const serveNext = async()=>{


    const token = localStorage.getItem("token");


    try{

        const response = await fetch(

            "https://smartqueue-backend-vjuh.onrender.com/api/appointment/admin/serve-next",

            {
                method:"PUT",

                headers:{
                    "Authorization":`Bearer ${token}`
                }
            }

        );


        const data = await response.json();

        console.log(data);


        fetchQueue();


    }
    catch(error){

        console.log(error);

    }

};


};


export default AdminQueue;