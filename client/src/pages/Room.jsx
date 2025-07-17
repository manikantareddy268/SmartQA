import { useParams } from "react-router-dom";
import Question from "./Question";
import axios from "axios";
import { serverEndpoint } from "../config/appConfig";
import { useState, useEffect } from "react";
import socket from "../config/socket";

function Room() {
    const { code } = useParams();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});
    const [room, setRoom] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [topQuestions, setTopQuestions] = useState([]);

    const fetchTopQuestions = async () => {
        try {
            const response = await axios.get(`${serverEndpoint}/room/${code}/top-questions`, {
                withCredentials: true,
            });
            setTopQuestions(response.data || []);
        } catch (error) {
            console.log(error);
            setErrors({ message: 'Unable to fetch top questions' });
        }
    };

    const fetchRoom = async () => {
        try {
            const response = await axios.get(`${serverEndpoint}/room/${code}`, {
                withCredentials: true,
            });
            setRoom(response.data);
        } catch (error) {
            console.log(error);
            setErrors({ message: "Unable to fetch room details, please try again" });
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`${serverEndpoint}/room/${code}/question`, {
                withCredentials: true,
            });
            setQuestions(response.data);
        } catch (error) {
            console.log(error);
            setErrors({ message: "Unable to fetch room details, please try again" });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await fetchRoom();
            await fetchQuestions();
            setLoading(false);
        };

        fetchData();

        socket.emit("join-room", code);

        socket.on("new-question", (question) => {
            setQuestions((prev) => [question, ...prev]);
        });

        return () => {
            socket.off("new-question");
        };
    }, []);

    if (loading) {
        return (
            <div className="container text-center py-5">
                <h3>Loading</h3>
                <p>Fetching room details...</p>
            </div>
        );
    }

    if (errors.message) {
        return (
            <div className="container text-center py-5">
                <h3>Error!</h3>
                <p>errors.message</p>
            </div>
        );
    }
    
    return (
        <div className="container py-5">
            <h2 className="mb-2">Room {code}</h2>
            <button className="btn btn-sm btn-outline-success" onClick={fetchTopQuestions}>
                Get Top Questions
            </button>
            <hr />
            {topQuestions.length > 0 && (
                <div className="mt-2">
                    <h5>Top Questions</h5>
                    <ul>
                        {topQuestions.map((question, index) => (
                            <li key={index}>{question}</li>
                        ))}
                    </ul>
                </div>
            )}
            <div className="row">
                <div className="col-auto">
                    <ul className="list-group">
                        {questions.map((ques) => (
                            <li key={ques._id} className="list-group-item">
                                {ques.content}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="row">
                <Question roomCode={code} />
            </div>
        </div>
    );
}

export default Room;