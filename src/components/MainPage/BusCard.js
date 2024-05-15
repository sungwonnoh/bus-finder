import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api.json";
import redBusImage from "../../assets/red_bus.png";

function BusCard() {
  const [timeToNextBuses, setTimeToNextBuses] = useState({});

  useEffect(() => {
    const findTimeToNextBuses = () => {
      const now = new Date();
      const nowTime = `${now.getHours() < 10 ? '0' : ''}${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;

      const nextBuses = {};
      api.forEach(item => {
        const currentTimeIndex = item.schedule.weekday.findIndex(time => time >= nowTime);

        if (currentTimeIndex !== -1) {
          const nextBusTime = item.schedule.weekday[currentTimeIndex];
          const nextBusHour = parseInt(nextBusTime.split(":")[0]);
          const nextBusMinute = parseInt(nextBusTime.split(":")[1]);
          const nextBusDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextBusHour, nextBusMinute);
          const timeDifference = nextBusDateTime - now;
          const timeToNextBusInMinutes = Math.round(timeDifference / 60000); // Convert milliseconds to minutes
          nextBuses[item.bus_number] = timeToNextBusInMinutes;
        } else {
          // If there are no more buses today, show the time until the first bus tomorrow
          const firstBusTomorrow = item.schedule.weekday[0];
          const firstBusHour = parseInt(firstBusTomorrow.split(":")[0]);
          const firstBusMinute = parseInt(firstBusTomorrow.split(":")[1]);
          const firstBusDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, firstBusHour, firstBusMinute);
          const timeDifference = firstBusDateTime - now;
          const timeToNextBusInMinutes = Math.round(timeDifference / 60000); // Convert milliseconds to minutes
          nextBuses[item.bus_number] = timeToNextBusInMinutes;
        }
      });

      setTimeToNextBuses(nextBuses);
    };

    const interval = setInterval(findTimeToNextBuses, 60000); // Update every minute
    findTimeToNextBuses(); // Initial call

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {Object.keys(timeToNextBuses).map(busNumber => (
        <Link to={`/detail/${busNumber}`} key={busNumber}>
          <div className="card card-side bg-base-100 shadow-xl my-4 hover:bg-base-200">
            <figure className="max-w-20 lg:max-w-24 ml-3.5 -mr-4">
              <img src={redBusImage} alt="bus image" />
            </figure>

            <div className="card-body">
              <h2 className="card-title text-base lg:text-lg">{busNumber}</h2>
              <p className="text-sm lg:text-base">{api.find(item => item.bus_number === busNumber).heading_to} 방면</p>
            </div>

            <div className="content-center p-3 bg-neutral rounded-box text-green-400">
              <span className="font-mono text-xl lg:text-3xl">
                <span>{timeToNextBuses[busNumber]}</span>
              </span>
              <span className="text-sm lg:text-lg">분</span>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}

export default BusCard;
