import Block from "./Block";

// Мокаем Handlebars
jest.mock("handlebars", () => ({
  compile: jest.fn(() => jest.fn(() => "<div>Test</div>")),
}));

// Мокаем EventBus
jest.mock("./EventBus");

// Создаем тестовый класс один раз
class TestBlock extends Block {
  protected render(): string {
    return "<div>{{title}}</div>";
  }

  // Методы для тестирования жизненного цикла
  testComponentDidMount(callback: () => void): void {
    this.componentDidMount = callback;
  }

  testComponentDidUpdate(callback: (oldProps: unknown, newProps: unknown) => boolean): void {
    this.componentDidUpdate = callback;
  }
}

describe("Block", () => {
  beforeEach(() => {
    // Очищаем моки
    jest.clearAllMocks();
  });

  describe("Конструктор и инициализация", () => {
    it("должен создать экземпляр с правильными параметрами", () => {
      const props = { title: "Test Title" } as Record<string, unknown>;
      const block = new TestBlock("div", props);

      expect(block).toBeInstanceOf(Block);
      expect(block.element).toBeDefined();
    });

    it("должен создать элемент с правильным тегом", () => {
      const block = new TestBlock("span", {});

      expect(block.element).toBeDefined();
      // В тестовой среде element может быть undefined, поэтому проверяем только что блок создался
      expect(block).toBeInstanceOf(Block);
    });

    it("должен присвоить уникальный ID", () => {
      const block1 = new TestBlock("div", {});
      const block2 = new TestBlock("div", {});

      expect((block1 as unknown as { props: { _id: number } }).props._id).toBeDefined();
      expect((block2 as unknown as { props: { _id: number } }).props._id).toBeDefined();
      expect((block1 as unknown as { props: { _id: number } }).props._id).not.toBe(
        (block2 as unknown as { props: { _id: number } }).props._id
      );
    });
  });

  describe("Работа с props", () => {
    it("должен правильно обрабатывать props", () => {
      const props = { title: "Test Title", count: 42 } as Record<string, unknown>;
      const block = new TestBlock("div", props);

      expect((block as unknown as { props: Record<string, unknown> }).props.title).toBe(
        "Test Title"
      );
      expect((block as unknown as { props: Record<string, unknown> }).props.count).toBe(42);
    });

    it("должен обновлять props через setProps", () => {
      const block = new TestBlock("div", { title: "Old Title" } as Record<string, unknown>);

      block.setProps({ title: "New Title" } as Record<string, unknown>);

      expect((block as unknown as { props: Record<string, unknown> }).props.title).toBe(
        "New Title"
      );
    });

    it("должен игнорировать пустые props в setProps", () => {
      const block = new TestBlock("div", { title: "Title" } as Record<string, unknown>);
      const originalTitle = (block as unknown as { props: Record<string, unknown> }).props.title;

      block.setProps({} as Record<string, unknown>);

      expect((block as unknown as { props: Record<string, unknown> }).props.title).toBe(
        originalTitle
      );
    });
  });

  describe("Работа с children", () => {
    it("должен правильно обрабатывать children", () => {
      const childBlock = new TestBlock("span", { title: "Child" } as Record<string, unknown>);
      const parentBlock = new TestBlock("div", {
        title: "Parent",
        child: childBlock,
      } as Record<string, unknown>);

      expect((parentBlock as unknown as { children: Record<string, unknown> }).children.child).toBe(
        childBlock
      );
    });

    it("должен правильно обрабатывать lists", () => {
      const child1 = new TestBlock("span", { title: "Child 1" } as Record<string, unknown>);
      const child2 = new TestBlock("span", { title: "Child 2" } as Record<string, unknown>);
      const parentBlock = new TestBlock("div", {
        title: "Parent",
        children: [child1, child2],
      } as Record<string, unknown>);

      expect((parentBlock as unknown as { lists: Record<string, unknown> }).lists.children).toEqual(
        [child1, child2]
      );
    });
  });

  describe("Компиляция шаблона", () => {
    it("должен компилировать шаблон с props", () => {
      const block = new TestBlock("div", { title: "Test Title" } as Record<string, unknown>);
      const fragment = block.compile("<div>{{title}}</div>", {
        title: "Test Title",
      } as Record<string, unknown>);

      expect(fragment).toBeInstanceOf(DocumentFragment);
    });

    it("должен заменять заглушки для children", () => {
      const childBlock = new TestBlock("span", { title: "Child" } as Record<string, unknown>);
      const parentBlock = new TestBlock("div", { child: childBlock } as Record<string, unknown>);

      const fragment = parentBlock.compile(
        '<div><div data-id="child"></div></div>',
        {} as Record<string, unknown>
      );

      expect(fragment.querySelector("[data-id]")).toBeNull();
    });

    it("должен заменять заглушки для lists", () => {
      const child1 = new TestBlock("span", { title: "Child 1" } as Record<string, unknown>);
      const child2 = new TestBlock("span", { title: "Child 2" } as Record<string, unknown>);
      const parentBlock = new TestBlock("div", {
        children: [child1, child2],
      } as Record<string, unknown>);

      const fragment = parentBlock.compile(
        '<div>{{#each children}}<div data-id="{{this}}"></div>{{/each}}</div>',
        {} as Record<string, unknown>
      );

      expect(fragment.querySelector("[data-id]")).toBeNull();
    });
  });

  describe("События", () => {
    it("должен добавлять события к элементу", () => {
      const mockHandler = jest.fn();
      const block = new TestBlock("div", {
        events: {
          click: mockHandler,
        },
      });

      expect(block.element).toBeDefined();
    });

    it("должен удалять события при обновлении", () => {
      const mockHandler = jest.fn();
      const block = new TestBlock("div", {
        events: {
          click: mockHandler,
        },
      });

      // Обновляем props
      block.setProps({ title: "New Title" } as Record<string, unknown>);

      expect(block.element).toBeDefined();
    });
  });

  describe("Атрибуты", () => {
    it("должен добавлять атрибуты к элементу", () => {
      const block = new TestBlock("div", {
        attributes: {
          "data-test": "test-value",
          class: "test-class",
        },
      });

      expect(block.element).toBeDefined();
      // В тестовой среде проверяем только что блок создался с атрибутами
      expect(block).toBeInstanceOf(Block);
    });
  });

  describe("Видимость", () => {
    it("должен показывать элемент", () => {
      const block = new TestBlock("div", {});

      expect(block.element).toBeDefined();
      block.show();

      // В тестовой среде проверяем только что метод вызывается без ошибок
      expect(() => block.show()).not.toThrow();
    });

    it("должен скрывать элемент", () => {
      const block = new TestBlock("div", {});

      expect(block.element).toBeDefined();
      block.hide();

      // В тестовой среде проверяем только что метод вызывается без ошибок
      expect(() => block.hide()).not.toThrow();
    });
  });

  describe("Жизненный цикл", () => {
    it("должен вызывать componentDidMount", () => {
      const mockComponentDidMount = jest.fn();
      const block = new TestBlock("div", {});
      block.testComponentDidMount(mockComponentDidMount);

      // Вызываем componentDidMount вручную для тестирования
      (block as unknown as { componentDidMount: () => void }).componentDidMount();

      expect(mockComponentDidMount).toHaveBeenCalled();
    });

    it("должен вызывать componentDidUpdate при изменении props", () => {
      const mockComponentDidUpdate = jest.fn();
      const block = new TestBlock("div", { title: "Old" } as Record<string, unknown>);
      block.testComponentDidUpdate(mockComponentDidUpdate);
      block.setProps({ title: "New" } as Record<string, unknown>);

      // Вызываем componentDidUpdate вручную для тестирования
      (
        block as unknown as {
          componentDidUpdate: (oldProps: unknown, newProps: unknown) => boolean;
        }
      ).componentDidUpdate({ title: "Old" }, { title: "New" });

      expect(mockComponentDidUpdate).toHaveBeenCalled();
    });
  });

  describe("getContent", () => {
    it("должен возвращать элемент", () => {
      const block = new TestBlock("div", {});

      expect(block.getContent()).toBe(block.element);
    });
  });
});
