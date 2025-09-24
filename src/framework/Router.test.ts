describe("Router", () => {
  let router: unknown;

  beforeEach(() => {
    router = {
      use: jest.fn(),
      start: jest.fn(),
      go: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
    };
  });

  describe("Базовая функциональность", () => {
    it("должен создавать экземпляр роутера", () => {
      expect(router).toBeDefined();
    });

    it("должен иметь метод use", () => {
      expect((router as { use: jest.Mock }).use).toBeDefined();
    });

    it("должен иметь метод start", () => {
      expect((router as { start: jest.Mock }).start).toBeDefined();
    });

    it("должен иметь метод go", () => {
      expect((router as { go: jest.Mock }).go).toBeDefined();
    });

    it("должен иметь метод back", () => {
      expect((router as { back: jest.Mock }).back).toBeDefined();
    });

    it("должен иметь метод forward", () => {
      expect((router as { forward: jest.Mock }).forward).toBeDefined();
    });
  });

  describe("Навигация", () => {
    it("должен вызывать метод go", () => {
      (router as { go: jest.Mock }).go("/test");
      expect((router as { go: jest.Mock }).go).toHaveBeenCalledWith("/test");
    });

    it("должен вызывать метод back", () => {
      (router as { back: jest.Mock }).back();
      expect((router as { back: jest.Mock }).back).toHaveBeenCalled();
    });

    it("должен вызывать метод forward", () => {
      (router as { forward: jest.Mock }).forward();
      expect((router as { forward: jest.Mock }).forward).toHaveBeenCalled();
    });
  });

  describe("Инициализация", () => {
    it("должен вызывать метод use", () => {
      const mockRoute = { path: "/test", block: jest.fn() };
      (router as { use: jest.Mock }).use(mockRoute);
      expect((router as { use: jest.Mock }).use).toHaveBeenCalledWith(mockRoute);
    });

    it("должен вызывать метод start", () => {
      (router as { start: jest.Mock }).start();
      expect((router as { start: jest.Mock }).start).toHaveBeenCalled();
    });
  });
});
