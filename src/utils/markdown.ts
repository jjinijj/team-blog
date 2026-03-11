export type BlockNode = 
| {type: 'h1'; value: string}
| {type: 'h2'; value: string}
| {type: 'h3'; value: string}
| {type: 'h4'; value: string}
| {type: 'blockquote'; value: string}
| {type: 'ol'; value: string[]}
| {type: 'ul'; value: string[]}
| {type: 'checklist', items: {checked:boolean; text:string}[] }
| {type: 'hr'}
| {type: 'p'; value: string}
| {type: 'code'; value: string}
| {type: 'table'; headers: string[]; align: ('left' | 'center' | 'right')[]; rows: string[][]}
;

export type InlineNode = 
| {type : 'text'; value: string}
| {type: 'strongAndEm'; value: string} 
| {type: 'strong'; value: string}
| {type: 'em'; value: string}
| {type: 'u'; value: string}
| {type: 'del'; value: string}
| {type: 'code'; value: string}
| {type: 'link'; value: string; url: string}
| {type: 'image'; value: string; url: string}
;

export const parseMarkdown = (markdown:string) : BlockNode[] => {
    
    const lines = markdown.split('\n');
    const nodes: BlockNode[] = [];

    let i = 0;
    while(i < lines.length){
        const line = lines[i];

        // 코드 블록
        if(line.startsWith('```')){
            i++;
            let code = '';
            while(i < lines.length && !lines[i].startsWith('```')){
                code += lines[i] + '\n';
                i++;
            }

            nodes.push({type: 'code', value: code.trimEnd()});
            i++;
            continue;
        }

        if(line.trim().startsWith('|') && line.trim().endsWith('|')){
            //최소 3중 필요 : 헤더, 구분선, 데이터
            if(i + 2 < lines.length){
                const headerLine = lines[i].trim();
                const separatorLine = lines[i + 1].trim();

                // 구분선 확인 (|-----|-----|)
                if(separatorLine.match(/^\|[\s:-]|$/)){
                    //헤더 파싱
                    const headers = headerLine.split('|')
                                                .filter(cell => cell.trim())
                                                .map(cell => cell.trim());
                    
                    // 정렬 정보 파싱
                    const align = separatorLine.split('|')
                                                .filter(cell => cell.trim())
                                                .map(cell => {
                                                    const trimmed = cell.trim();
                                                    if(trimmed.startsWith(':') && trimmed.endsWith(':')){
                                                        return 'center' as const;
                                                    }else if(trimmed.endsWith(':')){
                                                        return 'right' as const;
                                                    }else {
                                                        return 'left' as const;
                                                    }
                                                });

                    // 데이터 행 파싱
                    i +=2;
                    const rows: string[][] = [];

                    while(i < lines.length && lines[i].trim().startsWith('|') && lines[i].endsWith('|')){
                        const row = lines[i].trim()
                                            .split('|')
                                            .filter(cell => cell.trim())
                                            .map(cell => cell.trim());
                        rows.push(row);
                        i++;
                    }

                    nodes.push({type:'table', headers, align, rows});
                    continue;
                }
            }
        }

        // 제목4
        if(line.startsWith('####')){
            nodes.push({type:'h4', value: line.slice(5)});
            i++;
            continue;
        }

        // 제목3
        if(line.startsWith('###')){
            nodes.push({type:'h3', value: line.slice(4)});
            i++;
            continue;
        }

        // 제목2
        if(line.startsWith('##')){
            nodes.push({type:'h2', value: line.slice(3)});
            i++;
            continue;
        }

        // 제목1
        if(line.startsWith('#')){
            nodes.push({type:'h1', value:line.slice(2)});
            i++;
            continue;
        }

        // 인용구
        if(line.startsWith('>')){
            nodes.push({type:'blockquote', value: line.slice(1).trim()});
            i++;
            continue;
        }

        // 체크박스 리스트 (반각 + 전각 둘 다 지원)
        if(/^[-*]\s*[\[［][xX ][］\]]/.test(line)){
            const items: {checked: boolean; text: string}[] = [];
            
            while(i < lines.length && /^[-*]\s*[\[［][xX ][］\]]/.test(lines[i])){
                const line = lines[i];
                const checked = line.includes('[x]') || line.includes('[X]') || 
                               line.includes('［x］') || line.includes('［X］');
                const text = line.replace(/^[-*]\s*[\[［][xX ][］\]]\s*/, '').trim();
                items.push({checked, text});
                i++;
            }
            
            nodes.push({type: 'checklist', items});
            continue;
        }

        // 순서 없는 리스트
        if(line.startsWith('- ') || line.startsWith('* ')){
            const items: string[] = [];

            // 연속된 리스트 항목들을 모음
            while(i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))){
                items.push(lines[i].slice(2)); // '- ' 또는 '* ' 제거
                i++;
            }

            nodes.push({type: 'ul', value: items});
            continue;
        }

        // 순서 있는 리스트
        if(/^\d+\. /.test(line)){  // 숫자. 으로 시작하는지 체크
            const items: string[] = [];

            // 연속된 리스트 항목들을 모음
            while(i < lines.length && /^\d+\. /.test(lines[i])){
                // "1. " 부분 제거 (숫자와 점, 공백)
                items.push(lines[i].replace(/^\d+\. /, ''));
                i++;
            }

            nodes.push({type: 'ol', value: items});
            continue;
        }

        // 구분선 (---, ***, ___)
        if(line.trim() === '---' || line.trim() === '***' || line.trim() === '___'){
            nodes.push({type: 'hr'});
            i++;
            continue;
        }

        // 빈 줄 무시
        if(line.trim() === ''){
            i++;
            continue;
        }

        nodes.push({type:'p', value: line});
        i++;
    }

    return nodes;
};

export const parseInline = (text: string): InlineNode[] => {
    const result: InlineNode[] = [];
    let buffer = '';
    let i = 0;

    while(i < text.length){
        // inline code
        if(text[i] === '`'){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }
            i++;
            let code = '';
            while(i < text.length && text[i] !== '`'){
                code += text[i++];
            }
            result.push({type: 'code', value: code})
            i++;
            continue;
        }

        // image ![alt](URL) - 링크보다 먼저 체크!
        if(text[i] === '!' && text[i+1] === '['){
            i += 2; // ![ 건너뛰기

            // ] 찾기
            let altText = '';
            while(i < text.length && text[i] !== ']'){
                altText += text[i++];
            }

            // ![alt] 다음에 (URL)이 있는지 확인
            if(i < text.length && text[i] === ']' && text[i+1] === '('){
                i += 2; // ]( 건너뛰기
                let url = '';
                while(i < text.length && text[i] !== ')'){
                    url += text[i++];
                }

                if(text[i] === ')'){
                    // 이미지 완성
                    if(buffer){
                        result.push({type:'text', value: buffer});
                        buffer = '';
                    }
                    result.push({type: 'image', value: altText, url: url});
                    i++;
                    continue;
                }
            }
        }

        // link [텍스트](URL)
        if(text[i] === '['){
            const linkStart = i;
            i++;

            // ] 찾기
            let linkText = '';
            while(i < text.length && text[i] !== ']'){
                linkText += text[i++];
            }

            // [텍스트] 다음에 (URL)이 있는지 확인
            if(i < text.length && text[i] === ']' && text[i+1] === '('){
                i += 2; // ]( 건너뛰기
                let url = '';
                while(i < text.length && text[i] !== ')'){
                    url += text[i++];
                }

                if(text[i] === ')'){
                    // 링크 완성
                    if(buffer){
                        result.push({type:'text', value: buffer});
                        buffer = '';
                    }
                    result.push({type: 'link', value: linkText, url: url});
                    i++;
                    continue;
                }
            }

            // 링크 형식이 아니면 그냥 텍스트로
            i = linkStart;
            buffer += text[i++];
            continue;
        }

        // bold and italic
        if(text.startsWith('***', i)){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }

            i+= 3;
            let boldAndItalic = '';
            while(i < text.length && !text.startsWith('***', i)){
                boldAndItalic += text[i++];
            }
            result.push({type:'strongAndEm', value: boldAndItalic});
            i+=3;
            continue;
        }

        // bold
        if(text.startsWith('**', i)){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }

            i+= 2;
            let bold = '';
            while(i < text.length && !text.startsWith('**', i)){
                bold += text[i++];
            }
            result.push({type:'strong', value: bold});
            i+=2;
            continue;
        }

        // italic
        if(text.startsWith('*', i)){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }

            i+=1;
            let italic = '';
            while(i < text.length && !text.startsWith('*', i)){
                italic += text[i++];
            }
            result.push({type:'em', value: italic});
            i+=1;
            continue;
        }

        // strikethrough
        if(text.startsWith('~~', i)){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }

            i+=2;
            let del = '';
            while(i < text.length && !text.startsWith('~~', i)){
                del += text[i++];
            }
            result.push({type:'del', value: del});
            i+=2;
            continue;
        }

        // underline
        if(text.startsWith('__', i)){
            if(buffer){
                result.push({type:'text', value: buffer});
                buffer = '';
            }

            i+=2;
            let underline = '';
            while(i < text.length && !text.startsWith('__', i)){
                underline += text[i++];
            }
            result.push({type:'u', value: underline});
            i+=2;
            continue;
        }

        buffer += text[i++];
    }

    if(buffer)
        result.push({type:'text', value: buffer});

    return result;
}