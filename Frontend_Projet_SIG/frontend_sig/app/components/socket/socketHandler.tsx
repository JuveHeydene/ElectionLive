export function connectWebSocket(updateChart:any) {
    const socket = new WebSocket('ws://localhost:8000/ws/vote_results/');
  
    socket.onmessage = function (event) {
      const data = JSON.parse(event.data);
      updateChart(data);
    };
  
    socket.onerror = function (error) {
      console.error('WebSocket error:', error);
    };
  
    return socket;
  }
  