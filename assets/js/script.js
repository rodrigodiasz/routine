require("dotenv").config();

const form = document.getElementById("form");

form.addEventListener("submit", handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();

  const gender = getSelectedValue("gender");
  const age = getInputNumberValue("age");
  const weight = getInputNumberValue("weight");
  const height = getInputNumberValue("height");
  const activitylevel = getSelectedValue("activity_level");
  const objective = getSelectedValue("training-objective");

  const tmb = Math.round(
    gender === "female"
      ? 655 + 9.6 * weight + 1.8 * height - 4.7 * age
      : 66 + 13.7 * weight + 5 * height - 6.8 * age
  );

  const maintenance = Math.round(tmb * activitylevel);
  const loseWeight = maintenance - 450;
  const gainWeight = maintenance + 450;

  const layout = `
  <ul>
    <li>
      Seu metabolismo basal é de <strong>${tmb} calorias</strong>.
    </li>
    <li>
      Para manter o seu peso você precisa consumir em média <strong>${maintenance} calorias</strong>.
    </li>
    <li>
      Para perder peso você precisa consumir em média <strong>${loseWeight} calorias</strong>.
    </li>
    <li>
      Para ganhar peso você precisa consumir em média <strong>${gainWeight} calorias</strong>.
    </li>
  </ul>
  `;

  const result = document.getElementById("result");
  result.innerHTML = layout;

  const apiResponse = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Baseado nos dados do usuário monte uma rotina de treinos, com pelo menos 5 atividades físicas durante a semana, dando a opção de treinos de musculação e aeróbico durante os dias. Siga sempre um padrão nas mensagens, como por exemplo: Segunda-feira: [...], Terça-feira: [...], e assim por diante. Não seja proativo, não adicione nenhum texto adicional, apenas coloque o dia da semana e atividade. Quebre uma linha entre os dias.",
          },
          {
            role: "user",
            content: `Objetivo: ${objective}, Metabolismo basal: ${tmb}`,
          },
        ],
      }),
    }
  );

  const data = await apiResponse.json();
  const message = data.choices[0].message.content;

  const aiResponseElement = document.createElement("div");
  aiResponseElement.innerHTML = `
    <h3 class='routine_title'>Sua rotina de treinos personalizada:</h3>
    <pre>${message}</pre>
  `;
  result.appendChild(aiResponseElement);
}

function getSelectedValue(id) {
  const select = document.getElementById(id);
  return select.options[select.selectedIndex].value;
}

function getInputNumberValue(id) {
  return Number(document.getElementById(id).value);
}
