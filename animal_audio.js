// Sons e falas do Zé no navegador.
// O navegador só deixa tocar som depois do primeiro toque na página. Se uma
// fala for bloqueada (por exemplo, a fala da abertura), ela fica guardada e
// toca no primeiro toque, em vez de se perder.
window.fazendinhaAudio = {
  finish: null,
  waiting: null,
  stop() {
    this.finish?.(false);
  },
  play(path) {
    this.stop();
    return new Promise(resolve => {
      const audio = new Audio(path);
      const finish = success => {
        if (this.finish !== finish) return;
        this.finish = null;
        if (this.waiting === audio) this.waiting = null;
        audio.onended = audio.onerror = null;
        audio.pause();
        resolve(success);
      };
      this.finish = finish;
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.play().catch(error => {
        if (this.finish !== finish) return;
        if (error && error.name === 'NotAllowedError') {
          this.waiting = audio;
        } else {
          finish(false);
        }
      });
    });
  },
  unlock() {
    const audio = this.waiting;
    this.waiting = null;
    if (!audio) return;
    audio.play().catch(error => {
      if (error && error.name === 'NotAllowedError' && this.waiting === null) {
        this.waiting = audio; // Este toque ainda não liberou o som; tenta no próximo.
      } else {
        audio.onerror?.();
      }
    });
  },
};

(() => {
  const events = ['pointerdown', 'touchend', 'keydown', 'click'];
  const onGesture = () => window.fazendinhaAudio.unlock();
  events.forEach(e => window.addEventListener(e, onGesture, true));
})();
