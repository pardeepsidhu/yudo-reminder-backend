import axios from "axios";

const generete = async (req:any, res:any) => {
  try {

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).send({
        success: false,
        error: "Please Provide Required Prompt!"
      });
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/api/v1/content/generateReminder",
      {
        prompt
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    // Check API success
    if (
      !response.data ||
      response.data.success === false
    ) {
      throw new Error(
        response?.data?.message ||
        response?.data?.error ||
        "Failed To Generate Reminder Email"
      );
    }

    return res.status(200).send({
      success: true,
      data: response.data.response
    });

  } catch (error:any) {


    return res.status(400).send({
      success: false,
      error:
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error.message ||
        "Some Error Occurred While Generating Email!"
    });

  }
};



 async function chat(req: any, res: any) {
  try {
    const { query, history } = req.body;

     console.log("here is resoponse",query, history )
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "query is required",
      });
    }

    const response = await fetch(
      `${process.env.AI_SERVICE_URL}/api/v1/rhaenyra/chat?type=scheduler`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          history,
        }),
      }
    );
    

    const data = await response.json();
    console.log("here is resoponse",response,data)

    return res.status(response.status).json(data);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "AI generation failed",
    });
  }
}

export { generete ,chat };