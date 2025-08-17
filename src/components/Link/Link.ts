import Block from "@/framework/Block";

export class Link extends Block {
  constructor(props: any) {
    super("a", {
      ...props,
      events: {
        click: (e: Event) => {
          if (typeof props.onClick === "function") {
            props.onClick(e);
          }
        },
      },
    });
  }

  override render() {
    return `<a href="{{href}}" class="{{className}}">{{label}}</a>`;
  }
}
