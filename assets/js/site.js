function setupNavSpy() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const targets = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!links.length || !targets.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const currentFromScroll = () => {
    const offset = window.innerHeight * 0.35;
    let current = targets[0];
    targets.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) current = section;
    });
    setActive(current.id);
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6]
      }
    );

    targets.forEach((section) => observer.observe(section));
  }

  window.addEventListener("scroll", currentFromScroll, { passive: true });
  window.addEventListener("hashchange", currentFromScroll);
  currentFromScroll();
}

function setupCompareViewers() {
  document.querySelectorAll("[data-compare-viewer]").forEach((viewer) => {
    let isDragging = false;

    const clamp = (value) => Math.max(0, Math.min(100, value));

    const setSplit = (value) => {
      const split = clamp(value);
      viewer.style.setProperty("--split", `${split}%`);
      viewer.setAttribute("aria-valuenow", Math.round(split));
    };

    const valueFromPointer = (event) => {
      const rect = viewer.getBoundingClientRect();
      return ((event.clientX - rect.left) / rect.width) * 100;
    };

    const startDrag = (event) => {
      isDragging = true;
      viewer.setPointerCapture?.(event.pointerId);
      setSplit(valueFromPointer(event));
      event.preventDefault();
    };

    const moveDrag = (event) => {
      if (!isDragging) return;
      setSplit(valueFromPointer(event));
    };

    const stopDrag = (event) => {
      isDragging = false;
      viewer.releasePointerCapture?.(event.pointerId);
    };

    viewer.addEventListener("pointerdown", startDrag);
    viewer.addEventListener("pointermove", moveDrag);
    viewer.addEventListener("pointerup", stopDrag);
    viewer.addEventListener("pointercancel", stopDrag);
    viewer.addEventListener("keydown", (event) => {
      const current = parseFloat(getComputedStyle(viewer).getPropertyValue("--split")) || 50;
      const step = event.shiftKey ? 10 : 5;
      let next = current;

      if (event.key === "ArrowLeft") next = current - step;
      if (event.key === "ArrowRight") next = current + step;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = 100;
      if (next !== current) {
        setSplit(next);
        event.preventDefault();
      }
    });

    setSplit(parseFloat(getComputedStyle(viewer).getPropertyValue("--split")) || 50);
  });
}

function setupRegionalCards() {
  document.querySelectorAll("[data-regional-card]").forEach((card) => {
    const output = card.querySelector("[data-regional-output]");
    const options = [...card.querySelectorAll("[data-regional-option]")];
    if (!output || !options.length) return;

    const activate = (option) => {
      const nextSrc = option.dataset.outputSrc;
      if (!nextSrc) return;

      options.forEach((item) => item.classList.toggle("is-active", item === option));
      if (output.getAttribute("src") === nextSrc) return;

      output.style.opacity = "0";
      window.setTimeout(() => {
        output.src = nextSrc;
        output.style.opacity = "1";
      }, 90);
    };

    options.forEach((option) => {
      option.addEventListener("mouseenter", () => activate(option));
      option.addEventListener("mouseover", () => activate(option));
      option.addEventListener("pointerenter", () => activate(option));
      option.addEventListener("focus", () => activate(option));
      option.addEventListener("click", () => activate(option));
    });

    activate(options.find((option) => option.classList.contains("is-active")) || options[0]);
  });
}

setupNavSpy();
setupCompareViewers();
setupRegionalCards();
