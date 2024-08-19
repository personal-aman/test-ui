import React, {useEffect, useState} from 'react';
import './MainPage.css';
import axios from 'axios';

const MainPage = () => {
    const [transcript, setTranscript] = useState('');
    const [status, setStatus] = useState({
        stage1: 'yet to start',
        stage2: 'yet to start',
        stage3: 'yet to start',
    });
    const [transcriptId, setTranscriptId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const removeSpecialCharacters = (text) => {
        // Replace tabs with colons
        const textWithoutTabs = text.replaceAll('\t', ':');
        // Remove all characters except alphanumeric, whitespace, and colons
        const sanitizedText = textWithoutTabs
            .replace(/[^\w\s:]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        return sanitizedText;
    };

    const handleSaveTranscript = async () => {
        const sanitizedTranscript = removeSpecialCharacters(transcript);
        console.log('Sanitized Transcript:', sanitizedTranscript); // Optional: For debugging
        setIsLoading(true);
        try {
            const response = await axios.post('https://llm.advanceanalytics.ai/api/transcription/', {
                text: sanitizedTranscript,
            });
            await setTranscriptId(response.data.transcript_id);
            console.log('Transcript saved with ID:', response.data.transcript_id);
            setStatus({ stage1: 'yet to start', stage2: 'yet to start', stage3: 'yet to start' }); // Reset stages status
            setTimeout(() => {
                handleStage1(response.data.transcript_id);
            }, 1000);
        } catch (error) {
            console.error('Error saving transcript:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (status.stage1 === 'done') {
            handleStage2();
        }
    }, [status.stage1]);

    useEffect(() => {
        if (status.stage2 === 'done') {
            handleStage3();
        }
    }, [status.stage2]);

    useEffect(() => {
        if (status.stage3 === 'done') {
            handleSeeResults();
        }
    }, [status.stage3]);

    const handleStage1 = async (transId = 0) => {
        if (!transcriptId) {
            if (!transId) {
                alert('Please save the transcript first.');
                return;
            }
        }
        setStatus({ ...status, stage1: 'processing' });
        setIsLoading(true);
        try {
            await axios.post('https://llm.advanceanalytics.ai/api/classification/', {
                transcript_id: transcriptId || transId,
            });
            setStatus({ ...status, stage1: 'done' });
        } catch (error) {
            console.error('Error in Stage 1:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStage2 = async () => {
        if (!transcriptId) {
            alert('Please complete Stage 1 first.');
            return;
        }
        if (status.stage1 !== 'done') {
            alert('Please complete Stage 1 first.');
            return;
        }
        setStatus({ ...status, stage2: 'processing' });
        setIsLoading(true);
        try {
            await axios.post('https://llm.advanceanalytics.ai/api/classification-checker/', {
                transcript_id: transcriptId,
            });
            setStatus({ ...status, stage2: 'done' });
        } catch (error) {
            console.error('Error in Stage 2:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStage3 = async () => {
        if (!transcriptId) {
            alert('Please complete Stage 2 first.');
            return;
        }
        if (status.stage2 !== 'done') {
            alert('Please complete Stage 2 first.');
            return;
        }
        setStatus({ ...status, stage3: 'processing' });
        setIsLoading(true);
        try {
            await axios.post('https://llm.advanceanalytics.ai/api/rating/', {
                transcript_id: transcriptId,
            });
            setStatus({ ...status, stage3: 'done' });
        } catch (error) {
            console.error('Error in Stage 3:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSeeResults = async () => {
        if (status.stage3 !== 'done') {
            alert('Please complete all stages first.');
            return;
        }
        try {
            const response = await axios.get(
                `https://llm.advanceanalytics.ai/api/results/${transcriptId}`
            );
            setResults(response.data);
            console.log('Results:', response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
        }
    };

    return (
        <div className="main-container">
            <h1>Welcome to ADVANCE AI - LLM assessment</h1>
            <div className="section transcript">
                <textarea
                    value={transcript}
                    onChange={(e) => {
                        setTranscript(e.target.value);
                        setTranscriptId(null); // Allow resaving the transcript
                        setStatus({
                            stage1: 'yet to start',
                            stage2: 'yet to start',
                            stage3: 'yet to start'
                        }); // Reset stages status
                    }}
                    placeholder="Transcript Goes Here (at least 100 sentences)"
                />
            </div>
            <div className="section save-transcript">
                <button onClick={handleSaveTranscript} disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save the transcript'}
                </button>
            </div>
            <div className="section buttons">
                <button
                    onClick={handleStage1}
                    disabled={status.stage1 === 'done' || !transcriptId || isLoading}
                >
                    {'Stage 1: Classification model'}
                </button>
                <button
                    onClick={handleStage2}
                    disabled={status.stage1 !== 'done' || status.stage2 === 'done' || !transcriptId || isLoading}
                >
                    {'Stage 2: Classification Checker'}
                </button>
                <button
                    onClick={handleStage3}
                    disabled={status.stage2 !== 'done' || status.stage3 === 'done' || !transcriptId || isLoading}
                >
                    {'Stage 3: Scoring model'}
                </button>
            </div>
            <div className="section status">
                <div>Status: {status.stage1}</div>
                <div>Status: {status.stage2}</div>
                <div>Status: {status.stage3}</div>
            </div>
            <div className="section see-results">
                <button onClick={handleSeeResults} disabled={status.stage3 !== 'done'}>
                    See Results
                </button>
                <div className="section results-box">
                    {results ? (
                        <table>
                            <thead>
                            <tr>
                                <th>Statement</th>
                                <th>Category</th>
                                <th>Level</th>
                                <th>Reason</th>
                                <th>Confidence Score</th>
                            </tr>
                            </thead>
                            <tbody>
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td>{result.statement}</td>
                                    <td>{result.category}</td>
                                    <td>{result.level}</td>
                                    <td>{result.reason_for_level}</td>
                                    <td>{result.confidence_score}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        'Results will be shown here after processing.'
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;