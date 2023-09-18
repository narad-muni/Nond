import fs from "fs";
import Invoice from "App/Models/Invoice";
import Application from '@ioc:Adonis/Core/Application'
import { DateTime } from "luxon";
import StringUtils from "./StringUtils";
import PdfPrinter from "pdfmake/src/printer";

const fonts = {
    Roboto: {
        normal: Application.publicPath('fonts/Roboto-Regular.ttf'),
        bold: Application.publicPath('fonts/Roboto-Bold.ttf'),
        italics: Application.publicPath('fonts/Roboto-Italic.ttf'),
        bolditalics: Application.publicPath('fonts/Roboto-BoldItalic.ttf')
    }
};

export class PDFUtils {
    static async generateInvoices(path: string, invoiceData: Invoice[]) {
        const generatedFiles: string[] = [];

        for (const data of invoiceData) {
            const invoiceName = `${data.id}_${data.client.name}.pdf`;
            const emptyImagePath = "public/empty.png";
            let qrBlock, billingBlock, taxBlock = {};
            const billingParticulars: any[] = [];
            let taxBreakup: any = {};
            let taxBill: any = [["", "", "", ""]];

            if (data.company.upi) {
                qrBlock = [
                    {
                        width: 65,
                        margin: [0, 25, 0, 0],
                        text: "Scan to pay",
                    },
                    {
                        qr: `upi://pay?pa=${data.company.upi}&cu=INR`,
                        fit: 90,
                        width: 90,
                    }
                ]
            } else {
                qrBlock = [
                    {
                        width: 65,
                        margin: [0, 25, 0, 0],
                        text: "           ",
                    },
                    {
                        image: "emptyImage",
                        fit: 90,
                        width: 90,
                    }
                ]
            }

            data.particulars.particulars.forEach(e => {
                billingParticulars.push([
                    e.master || "-",
                    e.description || "-",
                    e.hsn || "-",
                    e.amount || "-",
                ]);

                if (data.gst) {
                    e.tax = e.gst * e.amount * .01;

                    if (taxBreakup[e.hsn]) {
                        // taxBreakup[e.hsn][0] += e.hsn;
                        taxBreakup[e.hsn][1] += e.amount;
                        // taxBreakup[e.hsn][2] += e.gst / 2;
                        taxBreakup[e.hsn][3] += (e.tax || 0) / 2;
                        // taxBreakup[e.hsn][4] += e.gst / 2;
                        taxBreakup[e.hsn][5] += (e.tax || 0) / 2;
                        taxBreakup[e.hsn][6] += e.tax || 0;
                    } else {
                        taxBreakup[e.hsn] = [];

                        taxBreakup[e.hsn][0] = e.hsn;
                        taxBreakup[e.hsn][1] = e.amount;
                        taxBreakup[e.hsn][2] = (e.gst || 0) / 2;
                        taxBreakup[e.hsn][3] = (e.tax || 0) / 2;
                        taxBreakup[e.hsn][4] = (e.gst || 0) / 2;
                        taxBreakup[e.hsn][5] = (e.tax || 0) / 2;
                        taxBreakup[e.hsn][6] = e.tax || 0;
                    }
                }
            });

            if (data.gst) {
                taxBill = [
                    [
                        {
                            text: "CGST",
                            colSpan: 2,
                            alignment: 'right'
                        },
                        "",
                        "",
                        (data.tax || 0) / 2
                    ],
                    [
                        {
                            text: "SGST",
                            colSpan: 2,
                            alignment: 'right'
                        },
                        "",
                        "",
                        (data.tax || 0) / 2
                    ]
                ];

                taxBlock = {
                    table: {
                        headerRows: 2,
                        body: [
                            [
                                {
                                    text: "HSN/SAC",
                                    rowSpan: 2
                                },
                                {
                                    text: "Taxable Value",
                                    rowSpan: 2,
                                    alignment: 'center'
                                },
                                {
                                    text: "State Tax",
                                    colSpan: 2,
                                    alignment: 'center'
                                },
                                '',
                                {
                                    text: "Central Tax",
                                    colSpan: 2,
                                    alignment: 'center'
                                },
                                '',
                                {
                                    text: "Total Taxable Amount",
                                    rowSpan: 2,
                                    alignment: 'center'
                                },
                            ],
                            [
                                '', '', 'Rate', 'Amount', 'Rate', 'Amount', ''
                            ],
                            Array(7).fill({ text: "", colSpan: 7 }),
                            ...Object.values(taxBreakup),
                            Array(7).fill({ text: "", colSpan: 7 }),
                            [
                                {
                                    text: "Total",
                                    alignment: "right",
                                    bold: true
                                },
                                data.total || 0,//total taxable amount
                                '',
                                (data.tax || 0) / 2,//sgst
                                '',
                                (data.tax || 0) / 2,//cgst
                                data.tax || 0,//total tax
                            ],
                            [
                                {
                                    stack: [
                                        {
                                            text: "Tax amount in words",
                                            fontSize: 9,
                                            margin: [0, 0, 0, 4]
                                        },
                                        {
                                            text: `INR ${StringUtils.inWords(data.tax || 0)} Only`,
                                            fontSize: 12,
                                            bold: true
                                        }
                                    ],
                                    colSpan: 7
                                },
                                ...Array(6).fill(""),
                            ]
                        ],
                        widths: "*",
                    },
                    margin: [0, 0, 0, 15],
                }
            }

            billingBlock = {
                table: {
                    headerRows: 1,
                    body: [
                        [
                            "Service",
                            "Description",
                            "HSN/SAC",
                            "Amount"
                        ],
                        Array(4).fill({ text: "", colSpan: 4 }),
                        ...billingParticulars,
                        Array(4).fill({ text: "", colSpan: 4 }),
                        ...taxBill,
                        Array(4).fill({ text: "", colSpan: 4 }),
                        [
                            {
                                text: "Total",
                                colSpan: 2,
                                alignment: 'right'
                            },
                            "",
                            "",
                            `₹ ${data.total + data.tax || "-"}`
                        ],
                        [
                            {
                                stack: [
                                    {
                                        text: "Amount Chargeable (in words)",
                                        fontSize: 9,
                                        margin: [0, 0, 0, 4]
                                    },
                                    {
                                        text: `INR ${StringUtils.inWords(data.total + data.tax || 0)} Only`,
                                        fontSize: 12,
                                        bold: true
                                    }
                                ],
                                colSpan: 4
                            },
                            Array(3).fill(""),
                        ]
                    ],
                    widths: "*",
                },
                margin: [0, 15, 0, 15],
            }

            const dd = {
                content: [
                    {
                        columns: [
                            {
                                image: "companyLogo",
                                fit: [80, 80], // 135w 80 h,
                                width: 80,
                                alignment: "center"
                            },
                            {
                                stack: [
                                    {
                                        text: data.company.name,
                                        bold: true,
                                        fontSize: '13',
                                        margin: [0, 0, 0, 5]
                                    },
                                    {
                                        columns: [
                                            {
                                                text: data.company.address,
                                                fontSize: '10'
                                            },
                                            {
                                                text: `GSTIN/UIN: ${data.company.gst || "-"}
                                            State Name : Maharashtra
                                            Code : 27
                                            E-Mail : ${data.company.email || "-"}`,
                                                fontSize: '10'
                                            },
                                        ],
                                    },
                                ],
                                width: 'auto',
                            },
                            {
                                layout: "lightHorizontalLines",
                                table: {
                                    body: [
                                        ["", ""],
                                        ["Invoice #", data.id],
                                        ["", ""],
                                        ["", ""],
                                        ["Date ", data?.date.toLocaleString(DateTime.DATE_MED) || "-"],
                                        ["", ""],
                                    ],
                                },
                                widths: ["auto"],
                                width: '150'
                            },
                        ],
                        columnGap: 10,
                        margin: 5,
                    },
                    {
                        columns: [
                            {
                                image: "clientLogo",
                                fit: [80, 80], // 135w 80 h,
                                width: 80,
                                alignment: "center"
                            },
                            {
                                stack: [
                                    {
                                        text: data.client.name,
                                        bold: true,
                                        fontSize: '13',
                                        margin: [0, 0, 0, 5]
                                    },
                                    {
                                        columns: [
                                            {
                                                text: data.client.address,
                                                fontSize: '10'
                                            },
                                            {
                                                text: `GSTIN/UIN: ${data.client.gst || "-"}
                                                State Name : Maharashtra
                                                Code : 27
                                                E-Mail : ${data.client.email || "-"}`,
                                                fontSize: '10'
                                            },
                                        ],
                                    },
                                ],
                                width: 'auto',
                            },
                            ...qrBlock
                        ],
                        columnGap: 10,
                        margin: 5,
                    },
                    billingBlock,
                    taxBlock,
                    {
                        columns: [
                            {
                                text: `Company’s Bank Details
                                A/c Holder’s Name : ${data.company.AHName || "-"}
                                Bank Name : ${data.company.BankName || "-"}
                                A/c No. : ${data.company.AccountNo || "-"}
                                Branch & IFS Code : ${data.company.IFSC || "-"}
                                `,
                                width: "*"
                            },
                            {
                                text: `Company’s PAN : ${data.company?.pan || "-"}`,
                                width: "*"
                            }
                        ],
                        margin: [0, 0, 0, 15],
                    },
                    {
                        columns: [
                            {
                                stack: [
                                    {}
                                ],
                                width: "*"
                            },
                            {
                                table: {
                                    body: [
                                        [
                                            {
                                                stack: [
                                                    {
                                                        stack: [
                                                            {
                                                                text: `for ` + data.company.name
                                                            },
                                                            {
                                                                text: `${data.company.name}
                                                                Digitally Signed on ${data.date}`,
                                                                fontSize: 10
                                                            },
                                                            {
                                                                text: `Authorised Signatory`
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        image: 'companySignature',
                                                        alignment: "center",
                                                        margin: [0, 5, 0, 0],
                                                        fit: data.client.logo ? [180, 50] : [0, 0]
                                                    }
                                                ]
                                            }
                                        ]
                                    ]
                                },
                                width: "auto"
                            }
                        ]
                    }
                ],
                pageMargins: 10,
                images: {
                    companyLogo: Application.makePath(data.company.logo || emptyImagePath),
                    companySignature: Application.makePath(data.company.signature || emptyImagePath),
                    clientLogo: Application.makePath(data.client.logo || emptyImagePath),
                    emptyImage: Application.makePath(emptyImagePath)
                },
            };

            await this.generatePdf(path, dd, invoiceName);
            generatedFiles.push(invoiceName);
        }

        return generatedFiles;
    }

    static async generatePdf(path, data, fileName) {


        if (!fs.existsSync(path)) {
            await fs.promises.mkdir(path, { recursive: true });
        }

        const printer = new PdfPrinter(fonts);

        const doc = printer.createPdfKitDocument(data);

        const chunks: any = [];

        const result: Buffer = await new Promise((resolve, reject) => {
            doc.on('data', function(chunk) {
                chunks.push(chunk);
            });

            doc.on('end', function() {
                resolve(Buffer.concat(chunks))
            });

            doc.end();
        });

        await fs.promises.writeFile(`${path}/${fileName}`, result);
    }
}
