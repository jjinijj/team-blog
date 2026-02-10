export interface StyleInfo{
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;
    fontSize: string | null;
    color: string | null;
}

// 현재 선택 영역 가져오기
export const getSelection = (): Selection | null => {
    return window.getSelection();
};

// 선택 영역이 유효한지 확인
export const hasSelection = () : boolean => {
    const selection = getSelection();
    return selection !== null && selection.rangeCount > 0;
};

// 현재 커서, 선택 위치의 스타일 분석
export const getCurrentStyles = (contaionerRef : HTMLElement) : StyleInfo => {
    const selection = getSelection();

    if(!selection || selection.rangeCount === 0){
        return {
            isBold: false,
            isItalic: false,
            isUnderline: false,
            fontSize: null,
            color: null,
        };
    }

    const range = selection.getRangeAt(0);
    let node: Node | null = range.startContainer;

    // 텍스트 노드면 부모 엘리먼트로
    if(node.nodeType === Node.TEXT_NODE){
        node = node.parentElement;
    }

    let element = node as HTMLElement;
    let isBold = false;
    let isItalic = false;
    let isUnderline = false;
    let fontSize: string | null = null;
    let color: string | null = null;

    // 부모 노드들을 순회하면서 스타일 확인
    while(element && element !== contaionerRef && element !== document.body){
        const tagName = element.tagName?.toLowerCase();
        const style = window.getComputedStyle(element);

        // isBold?
        if(!isBold && (tagName === 'strong') 
                    || tagName === 'b'
                    || style.fontWeight ==='bold'
                    || parseInt(style.fontWeight) >= 700){

            isBold = true;

        }

        // isItalic?
        if(!isItalic && (tagName === 'em') 
                    || tagName === 'i'
                    || style.fontStyle ==='italic'){

            isItalic = true;

        }

        // isUnderline?
        if(!isUnderline && (tagName === 'u') 
                    || style.textDecoration.includes('underline')){

            isUnderline = true;

        }

        // fontSize?
        if(!fontSize && (element.style.fontSize)){
            fontSize = element.style.fontSize;
        }

        // Color?
        if(!color && (element.style.color)){
            color = element.style.color;
        }

        element = element.parentElement as HTMLElement;
    }

    return {isBold, isItalic, isUnderline, fontSize, color};
}

// 선택 영역을 태그로 감싸기
export const wrapSelection = (tagName: string, styles?: Partial<CSSStyleDeclaration>): void => {

    const selection = getSelection();
    if(!selection || selection.rangeCount === 0)
        return;

    const range = selection.getRangeAt(0);

    //   선택영역이 비었으면 무시
    if(range.collapsed)
        return;

    const wrapper = document.createElement(tagName);

    // 스타일 적용
    if(styles){
        Object.keys(styles).forEach(key => {
            const value = styles[key as keyof CSSStyleDeclaration];
            if(value){
                wrapper.style[key as any] = value as string;
            }
        });
    }

    try{
        range.surroundContents(wrapper);
    }catch(e){
        // 여러 노드에 걸쳐있어서 surroundContents가 실패할 경우
        const fragment = range.extractContents();
        wrapper.appendChild(fragment);
        range.insertNode(wrapper);
    }

    // 선택 영역 복원
    range.selectNodeContents(wrapper);
    selection.removeAllRanges();
    selection.addRange(range);
};

// 선택 영역에서 특정 태그 제거
export const unwrapTag = (tagName: string) : void => {
    const selection = getSelection();
    if(!selection || selection.rangeCount === 0)
        return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // 모든 태그 찾기
    const findTags = (node: Node) : HTMLElement[] =>{
        const tags: HTMLElement[] = [];

        if(node.nodeType === Node.ELEMENT_NODE){
            const element = node as HTMLElement;
            if(element.tagName.toLowerCase() === tagName.toLowerCase()){
                tags.push(element);
            }
        }

        node.childNodes.forEach(child => {
            tags.push(...findTags(child));
        });

        return tags;
    }

    const tagsToUnwrap = findTags(container);

    tagsToUnwrap.forEach(tag => {
        const parent = tag.parentNode;
        if(parent){
            while(tag.firstChild){
                parent.insertBefore(tag.firstChild, tag);
            }
        }

        parent?.removeChild(tag);
    });
};

// 선택 영역에 스타일 적용(span)
export const applyStyle = (property: string, value: string) : void =>{
    const selection = getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
  
    // 선택 영역이 비어있으면 무시
    if (range.collapsed) return;

    const span = document.createElement('span');
    span.style[property as any] = value;

    try{
        range.surroundContents(span);
    }catch(e){
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
    }

    // 선택 영역 복원
    range.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(range);
};

// 선택 영역의 특정 스타일 제거
export const removeStyle = (property:string) : void =>{
    const selection = getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // span 태그중에 해당 스타일을 가진 것 찾기
    const findStyledSpans = (node: Node) : HTMLElement[] => {
        const spans: HTMLElement[] = [];

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;
          if (element.tagName.toLowerCase() === 'span' && element.style[property as any]) {
            spans.push(element);
          }
        }

        node.childNodes.forEach(child => {
          spans.push(...findStyledSpans(child));
        });

        return spans;
    };

    const spansToUpdate = findStyledSpans(container);

    spansToUpdate.forEach(span => {
      span.style.removeProperty(property);

      // 스타일이 모두 제거되면 span 자체를 언래핑
      if (!span.style.cssText) {
        const parent = span.parentNode;
        if (parent) {
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
        }
      }
    });
};

// Html을 정리
export const cleanHTML = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // 빈 태그 제거
    const removeEmptyTags = (element: HTMLElement) => {
    Array.from(element.children).forEach(child => {
      if (child.textContent?.trim() === '' && child.children.length === 0) {
      child.remove();
      } else {
      removeEmptyTags(child as HTMLElement);
      }
    });
    };
    
    removeEmptyTags(div);
    
    return div.innerHTML;
};