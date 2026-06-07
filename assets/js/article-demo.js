const slider = document.querySelector('#impactSlider');
const meter = document.querySelector('#impactMeter');
const label = document.querySelector('#impactLabel');

if (slider && meter && label) {
  const update = () => {
    const value = Number(slider.value);
    meter.style.width = `${value}%`;
    label.textContent = `${value}%`;
  };
  slider.addEventListener('input', update);
  update();
}
