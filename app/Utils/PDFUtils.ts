import PdfMake from "pdfmake";
import fs from "fs";
import asyncFs from "fs/promises";
import Invoice from "App/Models/Invoice";
import Application from '@ioc:Adonis/Core/Application'

export class PDFUtils{
    static async generateInvoices(path: string, invoiceData: Invoice[]) {
        const generatedFiles: string[] = [];

        for (const data of invoiceData) {
            const invoiceName = `${data.id}_${data.client.name}.pdf`;
            const emptyImagePath = "public/empty.png";
            let qrBlock;

            if(data.company.upi){
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
                console.log(`upi://pay?pa=${data.company.upi}&cu=INR`)
            }else{
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
                                    margin: [0,0,0,8]
                                },
                                {
                                    columns: [
                                        {
                                            text: data.company.address,
                                            fontSize: '10'
                                        },
                                        {
                                            text: `GSTIN/UIN: ${data.company.gst}
                                            State Name : Maharashtra
                                            Code : 27
                                            E-Mail : ${data.company.email}`,
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
                                ["Date ", data?.date?.toJSON().slice(0, 10) || "-"],
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
                                        margin: [0,0,0,8]
                                    },
                                    {
                                        columns: [
                                            {
                                                text: data.client.address,
                                                fontSize: '10'
                                            },
                                            {
                                                text: `GSTIN/UIN: ${data.client.gst}
                                                State Name : Maharashtra
                                                Code : 27
                                                E-Mail : ${data.client.email}`,
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
                    {
                        table: {
                            headerRows: 1,
                            body: [
                                [
                                    "Service",
                                    "Description",
                                    "HSN/SAC",
                                    "Amount"
                                ],
                                Array(4).fill({text:"", colSpan: 4}),
                                [
                                    "GST",
                                    {
                                        text: "GST 3B Filling",
                                        fontSize: 10
                                    },
                                    "123456",
                                    "2050"
                                ],
                                [
                                    "GST",
                                    {
                                        text: "GST 3B Filling",
                                        fontSize: 10
                                    },
                                    "123456",
                                    "2050"
                                ],
                                Array(4).fill({text:"", colSpan: 4}),
                                [
                                    {
                                        text: "CGST",
                                        colSpan: 2,
                                        alignment: 'right'
                                    },
                                    "",
                                    "",
                                    "254"
                                ],
                                [
                                    {
                                        text: "SGST",
                                        colSpan: 2,
                                        alignment: 'right'
                                    },
                                    "",
                                    "",
                                    "254"
                                ],
                                Array(4).fill({text:"", colSpan: 4}),
                                [
                                    {
                                        text: "Total",
                                        colSpan: 2,
                                        alignment: 'right'
                                    },
                                    "",
                                    "",
                                    "₹ 12540"
                                ],
                                [
                                    {
                                        stack: [
                                            {
                                                text: "Amount Chargeable (in words)",
                                                fontSize: 9,
                                                margin: [0,0,0,4]
                                            },
                                            {
                                                text: "INR Twenty Eight Thousand Three Hundred Twenty Only",
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
                        margin: [0, 15, 0, 0],
                    },
                    {
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
                                    '','','Rate','Amount','Rate','Amount',''
                                ],
                                Array(7).fill({text:"", colSpan: 7}),
                                [
                                    123456,
                                    124541,
                                    "9%",
                                    125,
                                    "9%",
                                    125,
                                    15540
                                ],
                                Array(7).fill({text:"", colSpan: 7}),
                                [
                                    {
                                        text: "Total",
                                        alignment: "right",
                                        bold: true
                                    },
                                    12345,
                                    '',
                                    125,
                                    '',
                                    125,
                                    124540
                                ],
                                [
                                    {
                                        stack: [
                                            {
                                                text: "Tax amount in words",
                                                fontSize: 9,
                                                margin: [0,0,0,4]
                                            },
                                            {
                                                text: "INR Twenty Eight Thousand Three Hundred Twenty Only",
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
                        margin: [0, 15, 0, 15],
                    },
                    {
                        columns: [
                            {
                                text: `Company’s Bank Details
                                A/c Holder’s Name : Nikhil M Shah & Associates
                                Bank Name : TJSB Bank Limited
                                A/c No. : 002120100009009
                                Branch & IFS Code : Thane Main & TJSB0000002
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
                                text: "",
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
                                                                text: `for `+data.company.name
                                                            },
                                                            {
                                                                text: `Nikhil Mansukhlal Shah
                                                                Digitally Signed on `+` 23:24`,
                                                                fontSize: 10
                                                            },
                                                            {
                                                                text: `Authorised Signatory`
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        image: 'emptyImage',
                                                        alignment: "center",
                                                        margin: [0,5,0,0],
                                                        fit: [180,50]
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
                    clientLogo: Application.makePath(data.client.logo || emptyImagePath),
                    emptyImage: Application.makePath(emptyImagePath)
                },
            };

            await this.generatePdf(path, dd, invoiceName);
            generatedFiles.push(invoiceName);
        }

        //some bug, need to generate extra pdf or one of the pdf gets corrupted
        await this.generatePdf(path, {}, "a.pdf");
        await asyncFs.rm(path+"/a.pdf");

        return generatedFiles;
    }

    static async generatePdf(path,data,fileName){
        const fonts = {
            Roboto: {
                normal: Application.publicPath('fonts/Roboto-Regular.ttf'),
                bold: Application.publicPath('fonts/Roboto-Bold.ttf'),
                italics: Application.publicPath('fonts/Roboto-Italic.ttf'),
                bolditalics: Application.publicPath('fonts/Roboto-BoldItalic.ttf')
            }
        };
      
        if (!fs.existsSync(path)) {
            await fs.promises.mkdir(path, { recursive: true });
        }

        const printer = new PdfMake(fonts);
        
        const pdfDoc = printer.createPdfKitDocument(data);
        const writeStream = fs.createWriteStream(`${path}/${fileName}`);
    
        await new Promise((resolve, reject) => {
            pdfDoc.pipe(writeStream);
            pdfDoc.on('end', resolve);
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
}