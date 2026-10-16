'use strict';
const MODULES = {"backbone":{"file":"person_backbone.py","title":"해상도를 줄이며 특징을 추출하는 CNN","description":"합성곱, GroupNorm, ReLU로 구성한 소형 CNN입니다. 세 단계의 특징맵을 다음 모듈로 전달합니다.","code":"x = self.stem(images)\nc2 = self.stage2(x)\nc3 = self.stage3(c2)\nc4 = self.stage4(c3)\n\nreturn {'c2': c2, 'c3': c3, 'c4': c4}","output":"C2 [32, 72, 96] · C3 [64, 36, 48] · C4 [128, 18, 24]"},"fpn":{"file":"person_fpn.py","title":"해상도가 다른 특징을 같은 채널로 결합","description":"1×1 합성곱으로 채널 수를 64로 맞추고, 깊은 층의 특징을 확대해 다음 단계의 특징에 더합니다.","code":"t4 = self.lateral4(c4)\nt3 = self.lateral3(c3) + F.interpolate(\n    t4, size=c3.shape[-2:], mode='nearest'\n)\nt2 = self.lateral2(c2) + F.interpolate(\n    t3, size=c2.shape[-2:], mode='nearest'\n)","output":"P2 [64, 72, 96] · P3 [64, 36, 48] · P4 [64, 18, 24]"},"head":{"file":"person_head.py","title":"사람 점수와 네 방향 거리와 중심도","description":"각 위치에서 사람 여부와 박스 경계까지의 거리, 중심도 원시 점수를 출력합니다. FPN의 세 레벨이 같은 헤드를 공유합니다.","code":"class_logits = self.class_output(class_feature)\nbox_distances = F.softplus(\n    self.box_output(box_feature)\n) * self.strides[level]\ncenterness_logits = self.center_output(box_feature)","output":"위치마다 분류 1채널 · 박스 거리 4채널 · 중심도 1채널"},"targets":{"file":"person_targets.py","title":"각 위치에 어떤 박스를 학습시킬 것인가","description":"박스 내부와 거리 범위를 확인하고, 여러 정답이 겹치면 면적이 작은 박스를 배정합니다. 빈 이미지도 배경으로 처리합니다.","code":"inside = distances.amin(dim=-1) > 0\nmax_distance = distances.amax(dim=-1)\neligible = inside & (max_distance >= low) & (max_distance < high)\ncosts[~eligible] = float('inf')\nmin_area, box_indices = costs.min(dim=1)\npositive = torch.isfinite(min_area)","output":"첫 이미지 양성 위치 84개 · 전체 박스 배정 217 / 218개"},"loss":{"file":"person_losses.py","title":"세 손실을 계산하고 역전파를 검증","description":"분류에는 Focal Loss, 박스에는 중심도로 가중한 −log IoU, 중심도에는 BCEWithLogits를 사용했습니다.","code":"classification = class_sum / normalizer\nbox = box_sum / center_weight_sum.clamp_min(1e-6)\ncenterness = center_sum / normalizer\n\ntotal = classification + box + centerness\ntotal.backward()","output":"수치 예제 · 빈 이미지 · 배치 2장 · 유한 gradient 검사 통과"},"training":{"file":"train_detector.py","title":"가중치를 갱신하고 저장한 모델을 다시 읽기","description":"첫 12장을 batch 2로 반복 학습했습니다. 실행 설정과 매 step의 손실을 기록하고 체크포인트의 출력 일치까지 확인했습니다.","code":"optimizer.zero_grad(set_to_none=True)\npredictions = model(images)\nlosses = compute_detection_loss(predictions, targets)\nlosses['total'].backward()\ntorch.nn.utils.clip_grad_norm_(model.parameters(), 5.0)\noptimizer.step()","output":"200 optimizer steps · last.pt 저장 · 모델 복원 출력 확인"}};
const $ = id => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attributes, parent) {
  const element = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attributes || {})) element.setAttribute(key, value);
  if (parent) parent.append(element);
  return element;
}
function boxRect(box, attributes, parent) {
  return svgEl('rect', {x: box[0], y: box[1], width: box[2]-box[0], height: box[3]-box[1], ...attributes}, parent);
}
const menuButton = document.querySelector('.menu-button');
menuButton.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(expanded));
  menuButton.setAttribute('aria-label', expanded ? '메뉴 닫기' : '메뉴 열기');
  $('navigation').classList.toggle('open', expanded);
});
$('navigation').querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', '메뉴 열기');
  $('navigation').classList.remove('open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', '메뉴 열기');
    $('navigation').classList.remove('open');
  }
});
function bindTabs(tabList) {
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  tabs.forEach((tab, index) => tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
  }));
}
function setActiveTabs(tabs, selected) {
  tabs.forEach(tab => {
    const active = tab === selected;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });
}
const moduleTabs = [...document.querySelectorAll('[data-module]')];
moduleTabs.forEach(button => button.addEventListener('click', () => {
  const entry = MODULES[button.dataset.module];
  setActiveTabs(moduleTabs, button);
  $('module-file').textContent = entry.file;
  $('module-title').textContent = entry.title;
  $('module-description').textContent = entry.description;
  $('module-code').textContent = entry.code;
  $('module-output').textContent = entry.output;
  $('module-panel').setAttribute('aria-labelledby', button.id);
}));
document.querySelectorAll('[role="tablist"]').forEach(bindTabs);
const dialog = $('simulation-dialog');
$('open-simulation').addEventListener('click', () => {
  $('simulation-frame').src = 'simulator.html';
  dialog.showModal();
});
function closeSimulation() { dialog.close(); }
$('close-simulation').addEventListener('click', closeSimulation);
dialog.addEventListener('click', event => { if (event.target === dialog) closeSimulation(); });
dialog.addEventListener('close', () => {
  $('simulation-frame').removeAttribute('src');
  $('open-simulation').focus();
});
const navLinks = [...$('navigation').querySelectorAll('a')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) {
      navLinks.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
  }, {rootMargin: '-20% 0px -55% 0px'});
  ['project', 'build', 'experiments', 'next'].forEach(id => observer.observe($(id)));
}

async function initialize() {
  const response = await fetch('assets/experiment.json');
  if (!response.ok) throw new Error('Experiment data unavailable');
  const data = await response.json();
  const first = data.preview.images[0];
  first.boxes.forEach(box => boxRect(box, {fill:'none', stroke:'#ffbd7b', 'stroke-width':'1.2', 'vector-effect':'non-scaling-stroke'}, $('hero-boxes')));
  let sceneIndex = 0;
  let visiblePredictions = [];
  const sceneTabs = [...document.querySelectorAll('[data-scene]')];
  const experimentPanel = document.querySelector('.experiment-workbench');
  experimentPanel.id = 'experiment-panel'; experimentPanel.setAttribute('role', 'tabpanel');
  sceneTabs.forEach(button => { button.id = 'scene-tab-' + button.dataset.scene; button.setAttribute('aria-controls','experiment-panel'); });
  function selectPrediction(index) {
    const entry = visiblePredictions.find(item => item.index === index);
    if (!entry) return;
    document.querySelectorAll('[data-prediction-id]').forEach(element => {
      const selected = Number(element.dataset.predictionId) === index;
      element.classList.toggle('selected', selected);
      element.setAttribute('aria-pressed', String(selected));
    });
    $('selected-box').textContent = 'P' + (index+1) + ' · score ' + entry.score.toFixed(3) + '\nxyxy [' + entry.box.map(v=>v.toFixed(1)).join(', ') + ']';
  }
  function renderScene() {
    const entry = data.preview.images[sceneIndex];
    const threshold = Number($('score-filter').value);
    $('score-value').textContent = threshold.toFixed(2);
    $('experiment-image').src = entry.image;
    $('experiment-image').alt = 'CAVIAR 원본 프레임 ' + entry.frame + '의 보행자 영상';
    $('scene-frame').textContent = '원본 프레임 ' + entry.frame;
    $('scene-origin').textContent = entry.trained ? '학습에 사용한 이미지' : '같은 영상 · 학습에 미사용';
    $('scene-origin').classList.toggle('unseen', !entry.trained);
    experimentPanel.setAttribute('aria-labelledby', 'scene-tab-' + sceneIndex);
    $('scene-note').textContent = entry.note;
    $('gt-count').textContent = entry.gt.length;
    visiblePredictions = entry.boxes.map((box,index)=>({box,index,score:entry.scores[index]})).filter(item=>item.score >= threshold);
    $('pred-count').textContent = visiblePredictions.length;
    $('experiment-boxes').replaceChildren();
    $('prediction-list').replaceChildren();
    $('selected-box').textContent = '예측을 선택하면 박스 좌표를 확인할 수 있습니다.';
    if ($('show-gt').checked) entry.gt.forEach(box=>boxRect(box, {'class':'truth-box'}, $('experiment-boxes')));
    if ($('show-pred').checked) visiblePredictions.forEach(item => {
      const rect = boxRect(item.box, {'class':'prediction-box', 'data-prediction-id':item.index, tabindex:0, role:'button', 'aria-pressed':'false', 'aria-label':'예측 P'+(item.index+1)+', 점수 '+item.score.toFixed(2)}, $('experiment-boxes'));
      svgEl('title', {}, rect).textContent = 'P'+(item.index+1)+' · '+item.score.toFixed(3);
      rect.addEventListener('click', ()=>selectPrediction(item.index));
      rect.addEventListener('keydown', event=> { if(event.key==='Enter'||event.key===' ') { event.preventDefault(); selectPrediction(item.index); } });
    });
    visiblePredictions.forEach(item => {
      const button = document.createElement('button');
      button.className = 'prediction-row';
      button.dataset.predictionId = item.index;
      button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label','예측 P'+(item.index+1)+' 선택, 점수 '+item.score.toFixed(2));
      const name=document.createElement('span'); name.textContent='P'+(item.index+1);
      const meter=document.createElement('span'); meter.className='score-meter'; meter.setAttribute('aria-hidden','true');
      const fill=document.createElement('i'); fill.style.width=(item.score*100)+'%'; meter.append(fill);
      const score=document.createElement('span'); score.textContent=item.score.toFixed(2);
      button.append(name,meter,score);
      button.addEventListener('click',()=>{
        if (!$('show-pred').checked) { $('show-pred').checked=true; renderScene(); }
        selectPrediction(item.index);
      });
      $('prediction-list').append(button);
    });
    $('no-boxes').hidden = visiblePredictions.length > 0 || !$('show-pred').checked;
  }
  sceneTabs.forEach(button=>button.addEventListener('click',()=>{
    sceneIndex=Number(button.dataset.scene);
    setActiveTabs(sceneTabs,button);
    renderScene();
  }));
  ['show-gt','show-pred'].forEach(id=>$(id).addEventListener('change',renderScene));
  $('score-filter').addEventListener('input',renderScene);
  renderScene();

  let metric='total';
  let selectedStep=200;
  let plot={};
  const metrics={total:'전체',classification:'분류',box:'박스',centerness:'중심도'};
  const metricTabs=[...document.querySelectorAll('[data-metric]')];
  const chartPanel=document.querySelector('.chart-card'); chartPanel.id='chart-panel'; chartPanel.setAttribute('role','tabpanel');
  metricTabs.forEach(button=>{ button.id='metric-'+button.dataset.metric; button.setAttribute('aria-controls','chart-panel'); });
  function updateMarker() {
    const value=data.losses[selectedStep-1][metric];
    const x=plot.x(selectedStep); const y=plot.y(value);
    const marker=$('chart-marker');
    marker.replaceChildren();
    svgEl('line',{x1:x,x2:x,y1:20,y2:plot.baseline,'class':'chart-marker-line'},marker);
    svgEl('circle',{cx:x,cy:y,r:5,'class':'chart-marker-dot'},marker);
    $('chart-step-label').textContent='STEP '+selectedStep;
    $('chart-reading').textContent=value.toFixed(4);
    $('step-slider').value=selectedStep;
    $('step-slider').setAttribute('aria-valuetext','Step '+selectedStep+', '+metrics[metric]+' 손실 '+value.toFixed(4));
    $('step-value').textContent=selectedStep+' / 200';
    $('chart-tip').textContent='STEP '+selectedStep+' · '+value.toFixed(4);
  }
  function renderChart() {
    const chart=$('loss-chart'); chart.replaceChildren();
    chart.setAttribute('aria-label','200 step의 실제 '+metrics[metric]+' 학습 손실 그래프');
    chartPanel.setAttribute('aria-labelledby','metric-'+metric);
    const maximum=Math.max(...data.losses.map(row=>row[metric]));
    const maxY=Math.ceil(maximum*1.08*10)/10;
    const compact=window.matchMedia('(max-width:600px)').matches;
    const width=compact?450:900, height=compact?280:330, baseline=height-45;
    chart.setAttribute('viewBox', '0 0 '+width+' '+height);
    chart.classList.toggle('compact',compact);
    plot={width,baseline,range:width-70,x:step=>50+(step-1)/199*(width-70),y:value=>baseline-value/maxY*(baseline-20)};
    const defs=svgEl('defs',{},chart);
    const gradient=svgEl('linearGradient',{id:'chart-fill',x1:0,y1:0,x2:0,y2:1},defs);
    svgEl('stop',{offset:'0%','stop-color':'#79f2cf','stop-opacity':'.17'},gradient);
    svgEl('stop',{offset:'100%','stop-color':'#79f2cf','stop-opacity':'0'},gradient);
    for(let i=0;i<=4;i++){
      const value=maxY*i/4; const y=plot.y(value);
      svgEl('line',{x1:50,x2:plot.width-20,y1:y,y2:y,'class':'chart-grid'},chart);
      const text=svgEl('text',{x:35,y:y+4,'text-anchor':'end','class':'chart-axis-label'},chart);text.textContent=value.toFixed(maxY<1?2:1);
    }
    [1,50,100,150,200].forEach(step=>{const text=svgEl('text',{x:plot.x(step),y:plot.baseline+28,'text-anchor':'middle','class':'chart-axis-label'},chart);text.textContent=step;});
    const points=data.losses.map(row=>plot.x(row.step).toFixed(2)+','+plot.y(row[metric]).toFixed(2));
    svgEl('path',{d:'M50,'+plot.baseline+'L'+points.join('L')+'L'+(plot.width-20)+','+plot.baseline+'Z',fill:'url(#chart-fill)'},chart);
    svgEl('path',{d:'M'+points.join('L'),'class':'chart-line'},chart);
    svgEl('g',{id:'chart-marker'},chart);
    updateMarker();
  }
  metricTabs.forEach(button=>button.addEventListener('click',()=>{metric=button.dataset.metric;setActiveTabs(metricTabs,button);renderChart();}));
  $('step-slider').addEventListener('input',()=>{selectedStep=Number($('step-slider').value);updateMarker();});
  $('loss-chart').addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse')return;
    const bounds=$('loss-chart').getBoundingClientRect();
    const position=(event.clientX-bounds.left)/bounds.width*plot.width;
    selectedStep=Math.max(1,Math.min(200,Math.round((position-50)/plot.range*199+1)));
    updateMarker();
    const tip=$('chart-tip');tip.hidden=false;
    tip.style.left=Math.max(0,Math.min(bounds.width-170,event.clientX-bounds.left+13))+'px';
    tip.style.top=Math.max(0,event.clientY-bounds.top-42)+'px';
  });
  $('loss-chart').addEventListener('pointerleave',()=>{$('chart-tip').hidden=true;});
  let resizeFrame;
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(renderChart);});
  renderChart();
  window.portfolioReady=true;
}
initialize().catch(error=>{console.error(error);$('load-error').hidden=false;});
