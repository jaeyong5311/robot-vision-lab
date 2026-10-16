# Robot Vision Lab

Computer Vision 개인 프로젝트 포트폴리오입니다.
39장·218개 정답 박스의 데이터 검수부터 PyTorch 탐지기 구현, 200 step 학습과 실제 예측 결과를 정리했습니다.

## 파일 구성

- `docs/`: 공개 웹사이트 전체(이미지, 학습 기록, 인터랙션, 2D 시뮬레이터)
- `.github/workflows/pages.yml`: main 브랜치 변경 시 GitHub Pages 자동 배포
- `scripts/set-public-url.mjs`: 실제 배포 주소를 공유용 메타데이터에 반영

## 최초 배포

1. GitHub에서 공개 저장소를 만들고 이 폴더의 내용을 main 브랜치에 올립니다.
2. 저장소 Settings → Pages → Build and deployment → Source에서 **GitHub Actions**를 선택합니다.
3. Actions → Deploy portfolio to GitHub Pages → Run workflow를 실행합니다.
4. 실행이 성공하면 Settings → Pages의 Visit site에서 실제 주소를 확인합니다.

## 내용 수정

`docs/index.html`, `docs/styles.css`, `docs/app.js` 등을 수정하고 main 브랜치에 반영하면 자동 배포합니다. `docs/assets/experiment.json`에는 공개용으로 정리한 실제 실험 기록만 담겨 있습니다.

## 공개 범위와 현재 단계

이 저장소에는 사이트 파일만 포함됩니다. 학습용 전체 데이터, 모델 체크포인트, 개인 PC 경로, 계정 인증 정보는 포함하지 않습니다.
이동 카메라 추적·실시간 위험 판단은 향후 목표이며, 현재 탐지기 첫 학습 실험과 독립적인 합성 2D 시뮬레이터를 구분해 표시합니다. AI 코드 가이드와 디버깅 보조 사용은 사이트 하단에 명시했습니다.

## 데이터 출처

CAVIAR 이미지 및 파생 시각화는 원 출처의 CC BY-SA 조건에 따라 출처를 표시했습니다.
EC Funded CAVIAR project / IST 2001 37540
https://homepages.inf.ed.ac.uk/rbf/CAVIARDATA1/
