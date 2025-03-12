import React, { useEffect, useState } from 'react';

const Feedbacks = ({ userType }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [newFeedback, setNewFeedback] = useState('');
    const [replyInputs, setReplyInputs] = useState({});

    useEffect(() => {
        fetchFeedbacks();
    }, [userType]);

    const handleAddFeedback = () => {
        if (newFeedback.trim() !== '') {
            saveFeedbacks('',newFeedback, '');
            setNewFeedback('');
        }
    };

    const handleReplyChange = (index, value) => {
        setReplyInputs({ ...replyInputs, [index]: value });
    };

    const saveFeedbacks = async (idd, newFeedback, replay) => {
        const newfeedBackJson = {
            id: idd,
            text: newFeedback,
            reply: replay,
            studentId: userType === 'STUDENT' ? localStorage.getItem("user") : '',
            consultantId: userType === 'CONSULTANT' ? localStorage.getItem("user") : ''
        }
        const response = await fetch(`http://localhost:8081/api/feedbacks/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(newfeedBackJson)
        });
        if (response.ok) {
            const data = await response.text();
            alert(data);
            fetchFeedbacks();
        } else {
            alert("Error fetching appointments:");
        }
    }

    const fetchFeedbacks = async () => {
        const response = await fetch(`http://localhost:8081/api/feedbacks/fetchAll`, {
            method: "GET",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (response.ok) {
            const data = await response.json();
            setFeedbacks(data);
        } else {
            alert("Error fetching appointments:");
        }
    }

    const handleReplySubmit = (index) => {
        if (userType === 'CONSULTANT' && replyInputs[index]) {
            const updatedFeedbacks = [...feedbacks];
            updatedFeedbacks[index].reply = replyInputs[index];
            saveFeedbacks(updatedFeedbacks[index].id, updatedFeedbacks[index].text, updatedFeedbacks[index].reply);
            setReplyInputs({ ...replyInputs, [index]: '' });
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Feedbacks</h2>

            {userType === 'STUDENT' && (
                <>
                    <textarea
                        value={newFeedback}
                        onChange={(e) => setNewFeedback(e.target.value)}
                        placeholder="Write your feedback..."
                        style={styles.textarea}
                    />
                    <button onClick={handleAddFeedback} style={styles.button}>Submit</button>
                </>
            )}

            <div style={styles.feedbackList}>
                {feedbacks.map((fb, index) => (
                    <div key={index} style={styles.feedbackCard}>
                        <p style={styles.feedbackText}><strong>Feedback:</strong> {fb.text}</p>
                        {fb.reply && <p style={styles.replyText}><strong>Reply:</strong> {fb.reply}</p>}
                        {userType === 'CONSULTANT' && (<>
                            <textarea
                                placeholder="Write a reply..."
                                onChange={(e) => handleReplyChange(index, e.target.value)}
                                style={styles.textareaSmall}
                            />
                            <button onClick={() => handleReplySubmit(index)} style={{ padding: '10px', cursor: 'pointer' }}>Submit</button>
                        </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '600px',
        margin: 'auto',
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
    heading: {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    textarea: {
        width: '90%',
        height: '100px',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        marginBottom: '10px',
        resize: 'none',
        fontSize: '14px',
    },
    button: {
        width: '100%',
        padding: '10px',
        backgroundColor: '#007BFF',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    feedbackList: {
        marginTop: '20px',
    },
    feedbackCard: {
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        marginBottom: '10px',
    },
    feedbackText: {
        fontSize: '14px',
        marginBottom: '5px',
    },
    replyText: {
        fontSize: '14px',
        fontStyle: 'italic',
        color: '#333',
    },
    textareaSmall: {
        width: '90%',
        height: '50px',
        padding: '8px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        resize: 'none',
        fontSize: '14px',
    },
};

export default Feedbacks;
