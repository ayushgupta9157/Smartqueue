import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function QueuePosition() {

  const { id } = useParams();

  const [queue, setQueue] = useState(null);


  useEffect(() => {

    const fetchQueue = async () => {

      const token = localStorage.getItem("token");


      try {

        const response = await fetch(
          `https://smartqueue-backend-vjuh.onrender.com/api/appointment/queue/${id}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );


        const data = await response.json();

        console.log(data);


        if(response.ok){

          setQueue(data);

        }
        else{

          alert(data.message);

        }


      } catch(error){

        console.log(error);

      }

    };


    fetchQueue();

  }, [id]);



  return (

    <div>

      <h2>
        Queue Position
      </h2>


      {
        queue &&

        <div>

          <h3>
            Token Number: {queue.tokenNumber}
          </h3>


          <h3>
            People Ahead: {queue.peopleAhead}
          </h3>


          <h3>
            Estimated Wait Time: {queue.estimatedWaitTime}
          </h3>


        </div>

      }


    </div>

  );

}


export default QueuePosition;