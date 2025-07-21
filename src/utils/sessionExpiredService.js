class SessionExpiredService {
  constructor() {
    this.listeners = [];
  }

  // Đăng ký listener
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Thông báo hiển thị modal
  showModal() {
    this.listeners.forEach(listener => listener(true));
  }

  // Thông báo ẩn modal
  hideModal() {
    this.listeners.forEach(listener => listener(false));
  }
}

export default new SessionExpiredService(); 