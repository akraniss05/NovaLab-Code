/* Run student code in a disposable worker belonging to an opaque iframe origin. */
(() => {
  function startWorker(source, runtime = 'javascript') {
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.setAttribute('sandbox', 'allow-scripts');
    const channel = new MessageChannel();
    const api = {
      onmessage: null,
      onerror: null,
      postMessage(value) { channel.port1.postMessage(value); },
      terminate() { channel.port1.close(); frame.remove(); },
    };
    channel.port1.onmessage = ({data}) => {
      if (data.kind === 'error') api.onerror?.({message: data.message});
      else api.onmessage?.({data: data.value});
    };
    const python = runtime === 'python' ? ' https://cdn.jsdelivr.net/pyodide/v0.27.7/full/' : '';
    const evalPermission = runtime === 'javascript' ? '' : " 'unsafe-eval'";
    const policy = "default-src 'none'; worker-src blob:; script-src 'unsafe-inline' blob:" +
      evalPermission + python + "; connect-src " + (python.trim() || "'none'");
    // Only the fixed bridge is embedded in HTML. Program text travels over the private port.
    frame.srcdoc = '<meta http-equiv="Content-Security-Policy" content="'+policy+'"><script>('+
      function bridge() {
        addEventListener('message', event => {
          if (event.source !== parent || !event.ports.length) return;
          const port = event.ports[0];
          try {
            const url = URL.createObjectURL(new Blob([event.data], {type:'text/javascript'}));
            const worker = new Worker(url);
            worker.onmessage = e => port.postMessage({kind:'result',value:e.data});
            worker.onerror = e => port.postMessage({kind:'error',message:e.message});
            port.onmessage = e => worker.postMessage(e.data);
            addEventListener('pagehide', () => {worker.terminate(); URL.revokeObjectURL(url)}, {once:true});
          } catch (error) {port.postMessage({kind:'error',message:error.message});}
        }, {once:true});
      }.toString()+')()<\/script>';
    frame.addEventListener('load', () => frame.contentWindow?.postMessage(source,'*',[channel.port2]), {once:true});
    document.body.append(frame);
    return api;
  }
  window.LLWorker = {start: startWorker};
})();
